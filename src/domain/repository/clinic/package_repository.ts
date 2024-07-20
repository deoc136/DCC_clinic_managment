import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { service_package } from '../../models/clinic/package_model';
import { eq } from 'drizzle-orm';

export class PackageRepository extends BaseRepository<typeof service_package> {
   constructor(db: NodePgDatabase) {
      super(service_package, db);
   }

   async getAllByServiceId(id: number) {
      return await this.db.select().from(this.table).where(eq(this.table.service_id, id));
   }
}
