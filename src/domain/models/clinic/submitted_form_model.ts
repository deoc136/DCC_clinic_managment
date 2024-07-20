import { InferModel } from 'drizzle-orm';
import { integer, pgTable, serial, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { form } from './form_model';
import { user } from './user_model';

export const submitted_form = pgTable('submitted_form', {
   id: serial('id').primaryKey(),
   url: text('url').notNull(),
   file_name: text('file_name').notNull(),
   form_id: integer('form_id')
      .notNull()
      .references(() => form.id),
   patient_id: integer('patient_id')
      .notNull()
      .references(() => user.id),
});

export type ISubmittedForm = InferModel<typeof submitted_form>;
export type NewSubmittedForm = InferModel<typeof submitted_form, 'insert'>;

export const submittedFormSchema = createInsertSchema(submitted_form, {
   url: z.string().url(),
});
