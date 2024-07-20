import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository } from '../base_repository';
import { software_owner } from '../../models/general/software_owner_model';
import { eq } from 'drizzle-orm';

export class SoftwareOwnerRepository extends BaseRepository<typeof software_owner> {
   constructor(db: NodePgDatabase) {
      super(software_owner, db);
   }

   async getByCognitoId(id: string) {
      return await this.db.select().from(this.table).where(eq(this.table.cognito_id, id)).limit(1);
   }
}
