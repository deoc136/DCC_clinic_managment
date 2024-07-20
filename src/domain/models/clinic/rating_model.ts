import { InferModel } from 'drizzle-orm';
import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { user } from './user_model';
import { z } from 'zod';
import { appointment } from './appointment_model';

export const rating = pgTable('rating', {
   id: serial('id').primaryKey(),
   quality: integer('quality').notNull(),
   kindness: integer('kindness').notNull(),
   punctuality: integer('punctuality').notNull(),
   knowledge: integer('knowledge').notNull(),
   appointment_id: integer('appointment_id')
      .notNull()
      .references(() => appointment.id),
   patient_id: integer('patient_id')
      .notNull()
      .references(() => user.id),
   therapist_id: integer('therapist_id')
      .notNull()
      .references(() => user.id),
});

export type IRating = InferModel<typeof rating>;
export type NewRating = InferModel<typeof rating, 'insert'>;

const ratingPropertySchema = z.number().min(0).max(5);

export const ratingSchema = createInsertSchema(rating, {
   kindness: ratingPropertySchema,
   knowledge: ratingPropertySchema,
   punctuality: ratingPropertySchema,
   quality: ratingPropertySchema,
});
