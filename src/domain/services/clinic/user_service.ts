import { z } from 'zod';
import { IUser, NewUser, user, userSchema } from '../../models/clinic/user_model';
import { FilledSchedule, UserRepository } from '../../repository/clinic/user_repository';
import { BaseClinicService } from '../base_clinic_service';
import boom from '@hapi/boom';
import { convertErrorIntoString } from '../../../application/utils';
import { passwordRegex } from '../../../application/regex';

const fullFilledUserSchema = z.object({
   user: userSchema,
   services: z.array(z.number()),
   schedules: z.array(
      z.object({
         days: z.array(z.number()).nonempty(),
         hour_ranges: z.array(
            z.object({
               start_hour: z.number(),
               end_hour: z.number(),
            })
         ),
      })
   ),
});

interface FullFilledUser {
   user: NewUser;
   schedules: FilledSchedule[];
   services: number[];
}

export class UserService extends BaseClinicService<typeof user> {
   constructor() {
      super(userSchema, UserRepository);
   }

   async getAllByRole(role: IUser['role'], slug: string) {
      const results = await (<UserRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllByRole(role);

      return results;
   }

   async getAllPatients(slug: string) {
      const results = await (<UserRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllPatients();

      return results;
   }

   async getByCognitoId(slug: string, cognitoId: string) {
      const results = await (<UserRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getByCognitoId(cognitoId);

      if (!results.length) {
         throw boom.notFound();
      } else {
         return results.at(0);
      }
   }

   async getFullFilledById(slug: string, id: number) {
      const result = await (<UserRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getFullFilledById(id);

      if (!result) {
         throw boom.notFound();
      } else {
         return result;
      }
   }

   async getTherapistsByServiceId(slug: string, id: number) {
      return await (<UserRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getTherapistsByServiceId(id);
   }

   async getAllTherapists(slug: string) {
      return await (<UserRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllTherapists();
   }

   async createFullFilled(data: FullFilledUser, slug: string) {
      const parsing = fullFilledUserSchema.safeParse(data);

      if (!parsing.success) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         data.user.id = undefined;

         const response = await (<UserRepository>(
            (
               await this.getRepositoryFromSlug(slug)
            ).repo
         )).createFullFilled(
            parsing.data.user,
            parsing.data.schedules,
            parsing.data.services,
            slug
         );
         return response;
      }
   }

   async signUp(user: NewUser & { password: string }, slug: string) {
      const parsing = userSchema.safeParse(user);

      if (!parsing.success) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         user.id = undefined;

         const response = await (<UserRepository>(
            (
               await this.getRepositoryFromSlug(slug)
            ).repo
         )).signUp(parsing.data, slug);
         return response;
      }
   }
}
