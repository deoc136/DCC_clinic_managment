import { InferModel } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { catalogType } from './catalog_type_model';

export const catalog = pgTable('catalog', {
   id: serial('id').primaryKey(),
   name: varchar('name', { length: 100 }).notNull(),
   display_name: varchar('display_name', { length: 100 }).notNull(),
   description: varchar('description', { length: 100 }).notNull(),
   code: varchar('code', { length: 100 }).notNull(),
   enabled: boolean('enabled').notNull(),

   parent_catalog_id: integer('parent_catalog_id'),
   catalog_type_id: integer('catalog_type_id')
      .notNull()
      .references(() => catalogType.id),
});

export type ICatalog = InferModel<typeof catalog>;
export type NewCatalog = InferModel<typeof catalog, 'insert'>;

export const catalogSchema = createInsertSchema(catalog);
