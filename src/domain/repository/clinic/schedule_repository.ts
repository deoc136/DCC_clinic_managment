import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schedule } from '../../models/clinic/schedule_model';
import { eq } from 'drizzle-orm';
import { scheduleDaySchema, schedule_day } from '../../models/clinic/schedule_day_model';
import { schedule_hour } from '../../models/clinic/schedule_hour_model';
import { FilledSchedule } from './user_repository';

export class ScheduleRepository extends BaseRepository<typeof schedule> {
   constructor(db: NodePgDatabase) {
      super(schedule, db);
   }

   async create(data: FilledSchedule & { user_id: number }) {
      return this.db.transaction(async tx => {
         try {
            const { schedule_id } = (
               await tx
                  .insert(schedule)
                  .values({ user_id: data.user_id })
                  .returning({ schedule_id: schedule.id })
            ).at(0)!;

            await Promise.all([
               ...data.days.map(
                  async day => await tx.insert(schedule_day).values({ day, schedule_id })
               ),
               ...data.hour_ranges.map(
                  async range =>
                     await tx.insert(schedule_hour).values({
                        schedule_id,
                        start_hour: range.start_hour.toString(),
                        end_hour: range.end_hour.toString(),
                     })
               ),
            ]);

            return {
               id: schedule_id,
            };
         } catch (error) {
            try {
               tx.rollback();
            } catch (error) {}

            throw error;
         }
      });
   }

   async delete(id: number) {
      return await this.db.transaction(async tx => {
         try {
            await Promise.all([
               tx.delete(schedule_day).where(eq(schedule_day.schedule_id, id)),
               tx.delete(schedule_hour).where(eq(schedule_hour.schedule_id, id)),
            ]);
            return await tx.delete(this.table).where(eq(this.table.id, id));
         } catch (error) {
            try {
               tx.rollback();
            } catch (error) {}

            throw error;
         }
      });
   }
}
