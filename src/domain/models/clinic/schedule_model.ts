import { InferModel } from 'drizzle-orm';
import { integer, numeric, pgTable, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { user } from './user_model';

export const schedule = pgTable('schedule', {
   id: serial('id').primaryKey(),
   user_id: integer('user_id')
      .notNull()
      .references(() => user.id),
});

export type ISchedule = InferModel<typeof schedule>;
export type NewSchedule = InferModel<typeof schedule, 'insert'>;

export const scheduleSchema = createInsertSchema(schedule);
