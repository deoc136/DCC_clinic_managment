import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { headquarter } from '../../models/clinic/headquarter_model';

export class HeadquarterRepository extends BaseRepository<typeof headquarter> {
   constructor(db: NodePgDatabase) {
      super(headquarter, db);
   }
}
