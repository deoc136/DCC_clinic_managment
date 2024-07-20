import { InferModel } from 'drizzle-orm';
import { integer, numeric, pgTable, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { schedule } from './schedule_model';

export const schedule_hour = pgTable('schedule_hour', {
   id: serial('id').primaryKey(),
   schedule_id: integer('schedule_id')
      .notNull()
      .references(() => schedule.id),
   start_hour: numeric('start_hour').notNull(),
   end_hour: numeric('end_hour').notNull(),
});

export type IScheduleHour = InferModel<typeof schedule_hour>;
export type NewScheduleHour = InferModel<typeof schedule_hour, 'insert'>;

export const scheduleHourSchema = createInsertSchema(schedule_hour);
