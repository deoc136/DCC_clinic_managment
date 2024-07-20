import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { NewAppointment, appointment } from '../../models/clinic/appointment_model';
import { and, eq, sql } from 'drizzle-orm';
import { NewUser, user } from '../../models/clinic/user_model';
import { alias } from 'drizzle-orm/pg-core';
import { service } from '../../models/clinic/service_model';
import {
   AdminDeleteUserCommand,
   CognitoIdentityProviderClient,
   SignUpCommand,
   SignUpCommandInput,
   SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig, config } from '../../../application/config';
import { generatePassword, getClinicAccessToken, paypal_url } from '../../../application/utils';
import boom from '@hapi/boom';
import { rating } from '../../models/clinic/rating_model';
import axios from 'axios';
import { ClinicService } from '../../services/general/clinic_service';

const clinicService = new ClinicService();

export class AppointmentRepository extends BaseRepository<typeof appointment> {
   constructor(db: NodePgDatabase) {
      super(appointment, db);
   }

   async get(id: number, slug: string) {
      return await this.db.transaction(async tx => {
         const appointments = await tx
            .select()
            .from(this.table)
            .where(eq(this.untypedTable.id, id))
            .limit(1);

         const appointmentData = appointments.at(0);

         if (
            appointmentData?.state === 'TO_PAY' &&
            appointmentData?.payment_method === 'ONLINE' &&
            appointmentData.invoice_id
         ) {
            const { clinic } = await clinicService.getBySlug(slug);

            const headers = await getClinicAccessToken(clinic);

            try {
               const { data: invoice } = await axios.get(
                  `${paypal_url}/v2/invoicing/invoices/${appointmentData.invoice_id}`,
                  {
                     headers,
                  }
               );

               if (invoice?.status === 'PAID') {
                  await tx
                     .update(appointment)
                     .set({
                        state: 'PENDING',
                        order_id: invoice?.payments?.transactions?.at(0)?.payment_id,
                     })
                     .where(eq(appointment.id, id));

                  return await tx
                     .select()
                     .from(this.table)
                     .where(eq(this.untypedTable.id, id))
                     .limit(1);
               }
            } catch (error) {
               await tx
                  .update(appointment)
                  .set({
                     invoice_id: null,
                  })
                  .where(eq(appointment.id, id));

               return await tx
                  .select()
                  .from(this.table)
                  .where(eq(this.untypedTable.id, id))
                  .limit(1);
            }

            return appointments;
         } else {
            return appointments;
         }
      });
   }

   async getAllByPatientId(id: number) {
      return await this.db.select().from(this.table).where(eq(this.table.patient_id, id));
   }

   async getAllByPatientIdWithRating(id: number) {
      return (
         await this.db
            .select({
               appointment,
               ratings: sql<string>`count(${rating.id})`,
            })
            .from(this.table)
            .where(eq(this.table.patient_id, id))
            .leftJoin(
               rating,
               and(eq(rating.appointment_id, appointment.id), eq(rating.patient_id, id))
            )
            .groupBy(appointment.id)
      ).map(({ ratings, appointment }) => ({ ratings, ...appointment }));
   }

   async getAllWithNames() {
      const patient = alias(user, 'patient');
      const therapist = alias(user, 'therapist');

      return await this.db
         .select({
            appointment: this.table,
            data: {
               patient_names: patient.names,
               patient_last_names: patient.last_names,

               therapist_names: therapist.names,
               therapist_last_names: therapist.last_names,

               patient_phone: patient.phone,

               service_name: service.name,
            },
         })
         .from(this.table)
         .innerJoin(patient, eq(patient.id, this.table.patient_id))
         .innerJoin(therapist, eq(therapist.id, this.table.therapist_id))
         .innerJoin(service, eq(service.id, this.table.service_id));
   }

   async createWithPatient($user: NewUser, appointment: NewAppointment, slug: string) {
      const client = new CognitoIdentityProviderClient(awsConfig);

      const input: SignUpCommandInput = {
         ClientId: config.cognito_user_pool,
         Username: $user.email,
         Password: generatePassword(),
         ClientMetadata: {
            arguments: JSON.stringify({
               slug,
            }),
         },
      };

      const command = new SignUpCommand(input);
      let response: SignUpCommandOutput | undefined;

      try {
         response = await client.send(command);
      } catch (error) {
         throw boom.conflict('Theres already an user with this email.');
      }

      const id = await this.db.transaction(async tx => {
         try {
            const patient_id = (
               await this.db
                  .insert(user)
                  .values({ ...$user, cognito_id: response?.UserSub ?? '' })
                  .returning({ id: user.id })
            ).at(0)?.id;

            if (!patient_id) {
               throw Error();
            }

            const appointment_id = (
               await this.db
                  .insert(this.table)
                  .values({ ...appointment, patient_id })
                  .returning({ id: this.table.id })
            ).at(0)?.id;

            return appointment_id;
         } catch (error) {
            try {
               tx.rollback();
            } catch (error) {}

            const input = {
               UserPoolId: config.cognito_user_pool,
               Username: $user.email,
            };
            const command = new AdminDeleteUserCommand(input);
            await client.send(command);

            throw error;
         }
      });

      return { id };
   }

   async createMultipleWithPatient($user: NewUser, appointments: NewAppointment[], slug: string) {
      const client = new CognitoIdentityProviderClient(awsConfig);

      const input: SignUpCommandInput = {
         ClientId: config.cognito_user_pool,
         Username: $user.email,
         Password: generatePassword(),
         ClientMetadata: {
            arguments: JSON.stringify({
               slug,
            }),
         },
      };

      const command = new SignUpCommand(input);
      let response: SignUpCommandOutput | undefined;

      try {
         response = await client.send(command);
      } catch (error) {
         throw boom.conflict('Theres already an user with this email.');
      }

      return await this.db.transaction(async tx => {
         try {
            const patient_id = (
               await this.db
                  .insert(user)
                  .values({ ...$user, cognito_id: response?.UserSub ?? '' })
                  .returning({ id: user.id })
            ).at(0)?.id;

            if (!patient_id) {
               throw Error();
            }

            const ids = await this.db
               .insert(this.table)
               .values(
                  appointments.map(appointment => ({ ...appointment, patient_id, id: undefined }))
               )
               .returning({ id: this.table.id });

            return {
               id: patient_id,
               appointment_ids: ids,
            };
         } catch (error) {
            try {
               tx.rollback();
            } catch (error) {}

            const input = {
               UserPoolId: config.cognito_user_pool,
               Username: $user.email,
            };
            const command = new AdminDeleteUserCommand(input);
            await client.send(command);

            throw error;
         }
      });
   }

   async cancelById(id: number, slug: string) {
      let passed = false;

      await this.db.transaction(async tx => {
         try {
            const [appointmentData, { clinic }] = await Promise.all([
               (await tx.select().from(appointment).where(eq(appointment.id, id))).at(0)!,
               await clinicService.getBySlug(slug),
            ]);

            if (!appointmentData) throw Error();

            passed = true;

            const [headers] = await Promise.all([
               getClinicAccessToken(clinic),
               tx.update(appointment).set({ state: 'CANCELED' }).where(eq(appointment.id, id)),
            ]);

            try {
               await axios.post(
                  `${paypal_url}/v2/payments/captures/${appointmentData.order_id}/refund`,
                  {},
                  {
                     headers,
                  }
               );
            } catch (error) {
               throw boom.badRequest('Unprocessable entity for paypal');
            }

            return;
         } catch (error) {
            try {
               tx.rollback();
            } catch (error) {}

            throw passed ? error : boom.badRequest('The slug or the id is invalid.');
         }
      });
   }
}
