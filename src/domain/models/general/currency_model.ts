import { InferModel } from 'drizzle-orm';
import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const currency = pgTable('currency', {
   id: serial('id').primaryKey(),
   name: text('name').notNull(),
   code: varchar('code', { length: 10 }).notNull(),
});

export type ICurrency = InferModel<typeof currency>;
export type NewCurrency = InferModel<typeof currency, 'insert'>;

export const currencySchema = createInsertSchema(currency);
