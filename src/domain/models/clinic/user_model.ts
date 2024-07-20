import { InferModel } from 'drizzle-orm';
import {
   boolean,
   date,
   integer,
   numeric,
   pgTable,
   serial,
   text,
   varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { onlyLettersRegex, onlyNumbersRegex } from '../../../application/regex';
import { headquarter } from './headquarter_model';

export const roles = ['ADMINISTRATOR', 'PATIENT', 'THERAPIST', 'RECEPTIONIST'] as const;
export const genres = ['MALE', 'FEMALE', 'OTHER'] as const;

export type Role = (typeof roles)[number];
export type Genre = (typeof genres)[number];

export const user = pgTable('user', {
   id: serial('id').primaryKey(),
   names: varchar('name', { length: 70 }).notNull(),
   last_names: varchar('last_names', { length: 70 }).notNull(),
   phone: text('phone').notNull(),
   address: varchar('address', { length: 200 }).notNull(),
   email: varchar('email', { length: 50 }).notNull(),
   enabled: boolean('enabled').notNull(),
   profile_picture: text('profile_picture').notNull(),

   cognito_id: varchar('cognito_id').notNull().unique(),
   role: text('role_id', { enum: roles }).notNull(),

   identification: text('identification'),
   identification_type: integer('identification_type'),
   headquarter_id: integer('headquarter_id').references(() => headquarter.id),

   retired: boolean('retired').default(false),

   birth_date: text('birth_date'),
   genre: text('genre', { enum: genres }),
   residence_country: integer('residence_country'),
   residence_city: integer('residence_city'),

   nationality: integer('nationality'),

   date_created: text('date_created').notNull(),
});

export type IUser = InferModel<typeof user>;
export type NewUser = InferModel<typeof user, 'insert'>;

export const userSchema = createInsertSchema(user, {
   email: z.string().email().max(50),
   address: z.string().max(200),
   names: z.string().regex(onlyLettersRegex, 'Only letters are accepted').max(70),
   last_names: z.string().regex(onlyLettersRegex, 'Only letters are accepted').max(70),
   phone: z.string().regex(onlyNumbersRegex, 'Only numbers are accepted').max(20),
});
