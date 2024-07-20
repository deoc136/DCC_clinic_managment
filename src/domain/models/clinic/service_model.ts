import { InferModel } from 'drizzle-orm';
import { boolean, integer, numeric, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { onlyNumbersRegex } from '../../../application/regex';

export const service = pgTable('service', {
   id: serial('id').primaryKey(),
   name: text('name').notNull(),
   price: numeric('price').notNull(),
   service_duration: numeric('service_duration').notNull(),
   pause_duration: numeric('pause_duration'),
   has_pause: boolean('has_pause').notNull(),
   description: text('description').notNull(),
   active: boolean('active').notNull(),

   removed: boolean('removed').default(false),
   picture_url: text('picture_url'),
});

export type IService = InferModel<typeof service>;
export type NewService = InferModel<typeof service, 'insert'>;

export const serviceSchema = createInsertSchema(service, {
   name: z.string().max(70),
   description: z.string().max(500),
   price: z.string().regex(onlyNumbersRegex, 'Only numbers are accepted'),
   pause_duration: z.string().regex(onlyNumbersRegex, 'Only numbers are accepted'),
   service_duration: z.string().regex(onlyNumbersRegex, 'Only numbers are accepted'),
   picture_url: z.string().url(),
});
