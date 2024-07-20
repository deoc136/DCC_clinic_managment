import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { submitted_form } from '../../models/clinic/submitted_form_model';

export class SubmittedFormRepository extends BaseRepository<typeof submitted_form> {
   constructor(db: NodePgDatabase) {
      super(submitted_form, db);
   }

   async getAllByPatientId(id: number) {
      return await this.db.select().from(this.table).where(eq(this.table.patient_id, id));
   }
}
