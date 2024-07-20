import { BaseRepository } from '../base_repository';
import { IUser, NewUser, user } from '../../models/clinic/user_model';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, sql } from 'drizzle-orm';
import { schedule } from '../../models/clinic/schedule_model';
import { schedule_day } from '../../models/clinic/schedule_day_model';
import { schedule_hour } from '../../models/clinic/schedule_hour_model';
import {
   AdminDeleteUserCommand,
   CognitoIdentityProviderClient,
   SignUpCommand,
   SignUpCommandInput,
   SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig, config } from '../../../application/config';
import { generatePassword } from '../../../application/utils';
import boom from '@hapi/boom';
import { user_service } from '../../models/clinic/user_service_model';
import { service } from '../../models/clinic/service_model';
import { appointment } from '../../models/clinic/appointment_model';
import { date } from 'drizzle-orm/pg-core';
import { rating } from '../../models/clinic/rating_model';

export type FilledSchedule = {
   days: number[];
   hour_ranges: {
      start_hour: number;
      end_hour: number;
   }[];
};

export class UserRepository extends BaseRepository<typeof user> {
   constructor(db: NodePgDatabase) {
      super(user, db);
   }

   async getAllByRole(role: IUser['role']) {
      return await this.db.select().from(this.table).where(eq(this.table.role, role));
   }

   async getByCognitoId(cognitoId: string) {
      return await this.db.select().from(this.table).where(eq(this.table.cognito_id, cognitoId));
   }

   async getFullFilledById(id: number) {
      const [user, rawSchedules, services] = await Promise.all([
         (
            await this.db
               .select({
                  user: this.table,
                  rating: {
                     quality: sql<number>`cast(avg(${rating.quality}) as numeric)`.mapWith(Number),
                     kindness: sql<number>`cast(avg(${rating.kindness}) as numeric)`.mapWith(
                        Number
                     ),
                     punctuality: sql<number>`cast(avg(${rating.punctuality}) as numeric)`.mapWith(
                        Number
                     ),
                     knowledge: sql<number>`cast(avg(${rating.knowledge}) as numeric)`.mapWith(
                        Number
                     ),
                  },
               })
               .from(this.table)
               .where(eq(this.untypedTable.id, id))
               .leftJoin(rating, eq(rating.therapist_id, id))
               .groupBy(this.table.id)
               .limit(1)
         ).at(0),
         this.db.select().from(schedule).where(eq(schedule.user_id, id)),
         await this.db
            .select()
            .from(user_service)
            .leftJoin(service, eq(user_service.service_id, service.id))
            .where(eq(user_service.user_id, id)),
      ]);

      if (!user?.user) return undefined;

      const schedulePromises = rawSchedules.map(async $schedule => {
         const [days, hour_ranges] = await Promise.all([
            this.db.select().from(schedule_day).where(eq(schedule_day.schedule_id, $schedule.id)),
            this.db.select().from(schedule_hour).where(eq(schedule_hour.schedule_id, $schedule.id)),
         ]);

         return {
            id: $schedule.id,
            days,
            hour_ranges,
         };
      });

      const schedules = await Promise.all(schedulePromises);

      return {
         ...user!,
         services,
         schedules,
      };
   }

   async createFullFilled(
      user: NewUser,
      schedules: FilledSchedule[],
      services: number[],
      slug: string
   ) {
      const client = new CognitoIdentityProviderClient(awsConfig);

      const input: SignUpCommandInput = {
         ClientId: config.cognito_user_pool,
         Username: user.email,
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
            const user_id = (
               await this.db
                  .insert(this.table)
                  .values({ ...user, cognito_id: response?.UserSub ?? '' })
                  .returning({ id: this.table.id })
            ).at(0)?.id;

            if (user_id === undefined) {
               throw Error();
            }

            const schedulePromises = schedules.map(async $schedule => {
               const { schedule_id } = (
                  await tx
                     .insert(schedule)
                     .values({ user_id })
                     .returning({ schedule_id: schedule.id })
               ).at(0)!;

               await Promise.all([
                  ...$schedule.days.map(
                     async day => await tx.insert(schedule_day).values({ day, schedule_id })
                  ),
                  ...$schedule.hour_ranges.map(
                     async range =>
                        await tx.insert(schedule_hour).values({
                           schedule_id,
                           start_hour: range.start_hour.toString(),
                           end_hour: range.end_hour.toString(),
                        })
                  ),
               ]);
            });

            await Promise.all([
               ...schedulePromises,
               ...services.map(
                  async id => await tx.insert(user_service).values({ service_id: id, user_id })
               ),
            ]);

            return user_id;
         } catch (error) {
            try {
               tx.rollback();
            } catch (error) {}

            const input = {
               UserPoolId: config.cognito_user_pool,
               Username: user.email,
            };
            const command = new AdminDeleteUserCommand(input);
            await client.send(command);

            throw error;
         }
      });

      return { id };
   }

   async getAllPatients() {
      const filteredAppointment = this.db
         .select()
         .from(appointment)
         .where(and(eq(appointment.state, 'CLOSED'), eq(appointment.assistance, 'ATTENDED')))
         .as('appointment');

      return await this.db
         .select({
            user: { ...user, last_appointment: sql<typeof date>`max(${appointment.date})` },
         })
         .from(user)
         .where(eq(user.role, 'PATIENT'))
         .leftJoin(filteredAppointment, eq(appointment.patient_id, user.id))
         .groupBy(user.id);
   }

   async getTherapistsByServiceId(id: number) {
      return await Promise.all(
         (
            await this.db
               .select({ user })
               .from(this.table)
               .innerJoin(user_service, eq(user_service.user_id, this.table.id))
               .where(and(eq(user_service.service_id, id), eq(user.role, 'THERAPIST')))
         ).map(async ({ user }) => {
            const rawSchedules = await this.db
               .select()
               .from(schedule)
               .where(eq(schedule.user_id, user.id));

            const schedulePromises = rawSchedules.map(async $schedule => {
               const [days, hour_ranges] = await Promise.all([
                  this.db
                     .select()
                     .from(schedule_day)
                     .where(eq(schedule_day.schedule_id, $schedule.id)),
                  this.db
                     .select()
                     .from(schedule_hour)
                     .where(eq(schedule_hour.schedule_id, $schedule.id)),
               ]);

               return {
                  id: $schedule.id,
                  days,
                  hour_ranges,
               };
            });

            const schedules = await Promise.all(schedulePromises);

            return {
               user,
               schedules,
            };
         })
      );
   }

   async getAllTherapists() {
      return await Promise.all(
         (
            await this.db.select({ user }).from(this.table).where(eq(user.role, 'THERAPIST'))
         ).map(async ({ user }) => {
            const rawSchedules = await this.db
               .select()
               .from(schedule)
               .where(eq(schedule.user_id, user.id));

            const schedulePromises = rawSchedules.map(async $schedule => {
               const [days, hour_ranges] = await Promise.all([
                  this.db
                     .select()
                     .from(schedule_day)
                     .where(eq(schedule_day.schedule_id, $schedule.id)),
                  this.db
                     .select()
                     .from(schedule_hour)
                     .where(eq(schedule_hour.schedule_id, $schedule.id)),
               ]);

               return {
                  id: $schedule.id,
                  days,
                  hour_ranges,
               };
            });

            const schedules = await Promise.all(schedulePromises);

            return {
               user,
               schedules,
            };
         })
      );
   }

   async signUp(user: NewUser, slug: string) {
      const client = new CognitoIdentityProviderClient(awsConfig);

      const input: SignUpCommandInput = {
         ClientId: config.cognito_user_pool,
         Username: user.email,
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
            return (
               await this.db
                  .insert(this.table)
                  .values({ ...user, cognito_id: response?.UserSub ?? '' })
                  .returning({ id: this.table.id })
            ).at(0)?.id;
         } catch (error) {
            try {
               tx.rollback();
            } catch (error) {}

            const input = {
               UserPoolId: config.cognito_user_pool,
               Username: user.email,
            };
            const command = new AdminDeleteUserCommand(input);
            await client.send(command);

            throw error;
         }
      });

      return { id };
   }
}
