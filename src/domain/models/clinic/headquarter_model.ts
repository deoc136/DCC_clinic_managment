import { InferModel } from 'drizzle-orm';
import { bigint, boolean, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { onlyLettersRegex, onlyNumbersRegex } from '../../../application/regex';

export const headquarter = pgTable('headquarter', {
   id: serial('id').primaryKey(),
   name: text('name').notNull(),
   city: integer('city').notNull(),
   address: text('address').notNull(),
   phone: text('phone').notNull(),
   index: integer('index').notNull(),

   removed: boolean('removed').default(false),
});

export type IHeadquarter = InferModel<typeof headquarter>;
export type NewHeadquarter = InferModel<typeof headquarter, 'insert'>;

export const headquarterSchema = createInsertSchema(headquarter, {
   address: z.string().max(200),
   name: z.string().regex(onlyLettersRegex, 'Only letters are accepted').max(70),
   phone: z.string().regex(onlyNumbersRegex, 'Only numbers are accepted').max(20),
});
