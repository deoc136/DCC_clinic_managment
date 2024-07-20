import { InferModel } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const file = pgTable('file', {
   id: serial('id').primaryKey(),
   url: text('url').notNull(),
   file_name: text('file_name').notNull(),
   public_name: text('public_name').notNull(),
});

export type IFile = InferModel<typeof file>;
export type NewFile = InferModel<typeof file, 'insert'>;

export const fileSchema = createInsertSchema(file, {
   url: z.string().url(),
});
