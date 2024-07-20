import { z } from 'zod';
import { convertErrorIntoString } from '../../../application/utils';
import { schedule, scheduleSchema } from '../../models/clinic/schedule_model';
import { ScheduleRepository } from '../../repository/clinic/schedule_repository';
import { FilledSchedule } from '../../repository/clinic/user_repository';
import { BaseClinicService } from '../base_clinic_service';
import boom from '@hapi/boom';

const filledScheduleSchema = z.object({
   user_id: z.number(),
   days: z.array(z.number()).nonempty(),
   hour_ranges: z.array(
      z.object({
         start_hour: z.number(),
         end_hour: z.number(),
      })
   ),
});

export class ScheduleService extends BaseClinicService<typeof schedule> {
   constructor() {
      super(scheduleSchema, ScheduleRepository);
   }

   async create(data: FilledSchedule & { user_id: number }, slug: string) {
      const parsing = filledScheduleSchema.safeParse(data);

      if (parsing.success === false) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         (data as any).id = undefined;

         const response = await (
            (
               await this.getRepositoryFromSlug(slug)
            ).repo as any as ScheduleRepository
         ).create(parsing.data);
         return response;
      }
   }
}
