import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { user_service } from '../../models/clinic/user_service_model';

export class UserServiceRepository extends BaseRepository<typeof user_service> {
   constructor(db: NodePgDatabase) {
      super(user_service, db);
   }
}
