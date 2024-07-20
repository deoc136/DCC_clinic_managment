import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { form } from '../../models/clinic/form_model';
import { eq } from 'drizzle-orm';
import { submitted_form } from '../../models/clinic/submitted_form_model';

export class FormRepository extends BaseRepository<typeof form> {
   constructor(db: NodePgDatabase) {
      super(form, db);
   }

   async delete(id: number) {
      return this.db.transaction(async tx => {
         await this.db.delete(submitted_form).where(eq(submitted_form.form_id, id));

         return await this.db.delete(this.table).where(eq(this.untypedTable.id, id));
      });
   }
}
