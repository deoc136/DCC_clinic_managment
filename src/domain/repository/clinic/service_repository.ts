import { eq } from 'drizzle-orm';
import { service } from '../../models/clinic/service_model';
import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { service_package } from '../../models/clinic/package_model';

export class ServiceRepository extends BaseRepository<typeof service> {
   constructor(db: NodePgDatabase) {
      super(service, db);
   }

   async delete(id: number) {
      return await this.db.transaction(async tx => {
         try {
            await tx.delete(service_package).where(eq(service_package.service_id, id));

            return await tx.delete(this.table).where(eq(this.untypedTable.id, id));
         } catch (error) {
            try {
               tx.rollback();
            } catch (error) {}
            throw error;
         }
      });
   }
}
