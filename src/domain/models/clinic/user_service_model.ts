import { InferModel } from 'drizzle-orm';
import { integer, numeric, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { user } from './user_model';
import { service } from './service_model';

export const user_service = pgTable('user_service', {
   id: serial('id').primaryKey(),
   user_id: integer('user_id')
      .notNull()
      .references(() => user.id),
   service_id: integer('service_id')
      .notNull()
      .references(() => service.id),
});

export type IUserService = InferModel<typeof user_service>;
export type NewUserService = InferModel<typeof user_service, 'insert'>;

export const userServiceSchema = createInsertSchema(user_service);
