import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { file } from '../../models/general/file_model';

export class FileRepository extends BaseRepository<typeof file> {
   constructor(db: NodePgDatabase) {
      super(file, db);
   }
}
