import { z } from 'zod';
import {
   NewAppointment,
   appointment,
   appointmentSchema,
} from '../../models/clinic/appointment_model';
import { NewUser, userSchema } from '../../models/clinic/user_model';
import { AppointmentRepository } from '../../repository/clinic/appointment_repository';
import { BaseClinicService } from '../base_clinic_service';
import boom from '@hapi/boom';
import { convertErrorIntoString } from '../../../application/utils';

const appointmentWithUserSchema = z.object({
   appointment: appointmentSchema,
   user: userSchema,
});

const multipleAppointmentsWithUserSchema = z.object({
   appointments: z.array(appointmentSchema),
   user: userSchema,
});

export class AppointmentService extends BaseClinicService<typeof appointment> {
   constructor() {
      super(appointmentSchema, AppointmentRepository);
   }

   async get(id: number, slug: string) {
      const results = await (await this.getRepositoryFromSlug(slug)).repo.get(id, slug);

      if (!results.length) {
         throw boom.notFound();
      } else {
         return results.at(0);
      }
   }

   async getAllByPatientId(id: number, slug: string) {
      const results = await (<AppointmentRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllByPatientId(id);

      return results;
   }

   async getAllByPatientIdWithRating(id: number, slug: string) {
      const results = await (<AppointmentRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllByPatientIdWithRating(id);

      return results;
   }

   async getAllWithNames(slug: string) {
      const results = await (<AppointmentRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllWithNames();

      return results;
   }

   async createWithPatient(
      data: {
         user: NewUser;
         appointment: NewAppointment;
      },
      slug: string
   ) {
      const parsing = appointmentWithUserSchema.safeParse(data);

      if (!parsing.success) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         data.user.id = undefined;
         data.appointment.id = undefined;

         const response = await (<AppointmentRepository>(
            (
               await this.getRepositoryFromSlug(slug)
            ).repo
         )).createWithPatient(parsing.data.user, parsing.data.appointment, slug);
         return response;
      }
   }

   async createMultipleWithPatient(
      data: {
         user: NewUser;
         appointments: NewAppointment[];
      },
      slug: string
   ) {
      const parsing = multipleAppointmentsWithUserSchema.safeParse(data);

      if (!parsing.success) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         data.user.id = undefined;

         const response = await (<AppointmentRepository>(
            (
               await this.getRepositoryFromSlug(slug)
            ).repo
         )).createMultipleWithPatient(parsing.data.user, parsing.data.appointments, slug);

         return response;
      }
   }

   async cancelById(id: number, slug: string) {
      try {
         await (<AppointmentRepository>(await this.getRepositoryFromSlug(slug)).repo).cancelById(
            id,
            slug
         );

         return 'Canceled successfully';
      } catch (error) {
         throw error;
      }
   }
}
