import { InferModel } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const form = pgTable('form', {
   id: serial('id').primaryKey(),
   url: text('url').notNull(),
   file_name: text('file_name').notNull(),
   public_name: text('public_name').notNull(),
});

export type IForm = InferModel<typeof form>;
export type NewForm = InferModel<typeof form, 'insert'>;

export const formSchema = createInsertSchema(form, {
   url: z.string().url(),
});
