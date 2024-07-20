import { InferModel } from 'drizzle-orm';
import { date, integer, numeric, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { service } from './service_model';
import { user } from './user_model';
import { appointment } from './appointment_model';

export const clinic_history = pgTable('clinic_history', {
   id: serial('id').primaryKey(),
   service_id: integer('service_id')
      .notNull()
      .references(() => service.id),
   date: text('date').notNull(),
   hour: integer('hour').notNull(),
   patient_id: integer('patient_id')
      .notNull()
      .references(() => user.id),
   therapist_id: integer('therapist_id')
      .notNull()
      .references(() => user.id),
   appointment_id: integer('appointment_id')
      .notNull()
      .references(() => appointment.id),
   content: text('content').notNull(),
});

export type IHistoryState = InferModel<typeof clinic_history>;
export type HistoryState = InferModel<typeof clinic_history, 'insert'>;

export const clinicHistorySchema = createInsertSchema(clinic_history, {});
