import { InferModel } from 'drizzle-orm';
import { bigint, boolean, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { catalog } from './catalog_model';
import { onlyLettersRegex } from '../../../application/regex';
import { currency } from './currency_model';
import { file } from './file_model';

export const clinic = pgTable('clinic', {
   id: serial('id').primaryKey(),
   name: varchar('name', { length: 50 }).notNull(),
   web_page: text('web_page').notNull(),
   active: boolean('active').notNull().default(true),

   slug: varchar('slug', { length: 70 }).notNull().unique(),

   country: integer('country')
      .notNull()
      .references(() => catalog.id),

   currency_id: integer('currency_id').references(() => currency.id),

   identification_id: integer('identification_id')
      .notNull()
      .references(() => catalog.id),

   profile_picture_url: text('profile_picture_url').notNull(),

   identification: text('identification').notNull(),

   administrator_id: text('administrator_id'),

   hide_for_therapist: boolean('hide_for_therapist').default(false),
   hide_for_receptionist: boolean('hide_for_receptionist').default(false),
   hide_for_patients: boolean('hide_for_patients').default(false),

   removed: boolean('removed').default(false),

   clinic_policies: integer('clinic_policies').references(() => file.id),
   terms_and_conditions: integer('terms_and_conditions').references(() => file.id),
   service_policies: integer('service_policies').references(() => file.id),

   cancelation_hours: integer('cancelation_hours').default(0).notNull(),

   paypal_id: text('paypal_id').notNull(),
   paypal_secret_key: text('paypal_secret_key').notNull(),
});

export type IClinic = InferModel<typeof clinic>;
export type NewClinic = InferModel<typeof clinic, 'insert'>;

export const clinicSchema = createInsertSchema(clinic, {
   name: z.string().regex(onlyLettersRegex, 'Only letters are accepted').max(70),

   web_page: z.string().url(),

   profile_picture_url: z.string().url(),
});
