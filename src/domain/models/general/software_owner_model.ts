import { InferModel } from 'drizzle-orm';
import { bigint, boolean, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const software_owner = pgTable('software_owner', {
   id: serial('id').primaryKey(),
   name: varchar('name', { length: 50 }).notNull(),
   last_name: varchar('last_name', { length: 50 }).notNull(),
   phone: text('phone').notNull(),
   address: varchar('address', { length: 70 }).notNull(),
   email: varchar('email', { length: 50 }).notNull(),
   enabled: boolean('enabled').notNull(),

   cognito_id: varchar('cognito_id').notNull(),
});

export type ISoftwareOwner = InferModel<typeof software_owner>;
export type NewSoftwareOwner = InferModel<typeof software_owner, 'insert'>;

export const softwareOwnerSchema = createInsertSchema(software_owner, {
   email: z.string().email(),
});
