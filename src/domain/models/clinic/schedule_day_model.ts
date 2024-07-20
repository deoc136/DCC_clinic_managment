import { InferModel } from 'drizzle-orm';
import { integer, numeric, pgTable, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { schedule } from './schedule_model';

export const schedule_day = pgTable('schedule_day', {
   id: serial('id').primaryKey(),
   schedule_id: integer('schedule_id')
      .notNull()
      .references(() => schedule.id),
   day: integer('day').notNull(),
});

export type IScheduleDay = InferModel<typeof schedule_day>;
export type NewScheduleDay = InferModel<typeof schedule_day, 'insert'>;

export const scheduleDaySchema = createInsertSchema(schedule_day);
