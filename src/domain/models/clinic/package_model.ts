import { InferModel } from 'drizzle-orm';
import { boolean, integer, numeric, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { onlyNumbersRegex } from '../../../application/regex';
import { service } from './service_model';

export const service_package = pgTable('package', {
   id: serial('id').primaryKey(),
   name: text('name').notNull(),
   price: numeric('price').notNull(),
   description: text('description').notNull(),
   service_id: integer('service_id')
      .notNull()
      .references(() => service.id),
   quantity: numeric('quantity').notNull(),
});

export type IPackage = InferModel<typeof service_package>;
export type NewPackage = InferModel<typeof service_package, 'insert'>;

export const packageSchema = createInsertSchema(service_package, {
   name: z.string().max(70),
   description: z.string().max(500),
   price: z.string().regex(onlyNumbersRegex, 'Only numbers are accepted'),
});
