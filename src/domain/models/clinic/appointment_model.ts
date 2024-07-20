import { InferModel, sql } from 'drizzle-orm';
import { boolean, date, integer, numeric, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { service } from './service_model';
import { headquarter } from './headquarter_model';
import { user } from './user_model';
import { z } from 'zod';

export const appointmentState = ['PENDING', 'TO_PAY', 'CANCELED', 'CLOSED'] as const;
export const paymentType = ['ONLINE', 'CASH', 'CARD'] as const;
export const assistance = ['ATTENDED', 'MISSED'] as const;

export const appointment = pgTable('appointment', {
   id: serial('id').primaryKey(),
   service_id: integer('service_id')
      .notNull()
      .references(() => service.id),
   state: text('state', { enum: appointmentState }).notNull(),

   date: text('date').notNull(),
   hour: integer('hour').notNull(),
   creation_date: text('creation_date').notNull(),

   price: numeric('price').notNull(),
   headquarter_id: integer('headquarter_id')
      .notNull()
      .references(() => headquarter.id),
   patient_id: integer('patient_id')
      .notNull()
      .references(() => user.id),
   therapist_id: integer('therapist_id')
      .notNull()
      .references(() => user.id),

   from_package: boolean('from_package').default(false),

   payment_method: text('payment_method', { enum: paymentType }),

   hidden: boolean('hidden').default(false),

   assistance: text('assistance', { enum: assistance }),

   order_id: text('order_id'),
   invoice_id: text('invoice_id'),
});

export type IAppointment = InferModel<typeof appointment>;
export type NewAppointment = InferModel<typeof appointment, 'insert'>;

export const appointmentSchema = createInsertSchema(appointment, {});
