import { InferModel } from 'drizzle-orm';
import { boolean, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const catalogType = pgTable('catalogType', {
   id: serial('id').primaryKey(),
   name: varchar('name', { length: 100 }).notNull(),
   description: varchar('description', { length: 100 }).notNull(),
   code: varchar('code', { length: 100 }).notNull(),
   enabled: boolean('enabled').notNull(),
});

export type ICatalogType = InferModel<typeof catalogType>;
export type NewCatalogType = InferModel<typeof catalogType, 'insert'>;

export const catalogTypeSchema = createInsertSchema(catalogType);
