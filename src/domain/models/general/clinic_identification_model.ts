import { InferModel } from 'drizzle-orm';
import { integer, pgTable, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { clinic } from './clinic_model';
import { z } from 'zod';
import { catalog } from './catalog_model';

export const clinic_identification = pgTable('clinic_identification', {
   id: serial('id').primaryKey(),

   clinic_id: integer('clinic_id')
      .notNull()
      .references(() => clinic.id),
   identification_id: integer('identification_id')
      .notNull()
      .references(() => catalog.id),
});

export type IClinicIdentification = InferModel<typeof clinic_identification>;
export type NewClinicIdentification = InferModel<typeof clinic_identification, 'insert'>;

export const clinicIdentificationSchema = createInsertSchema(clinic_identification, {
   clinic_id: z.string().min(1),
   identification_id: z.string().min(1),
});
