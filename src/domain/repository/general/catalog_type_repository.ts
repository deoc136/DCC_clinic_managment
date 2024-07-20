import { catalogType } from '../../models/general/catalog_type_model';
import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export class CatalogTypeRepository extends BaseRepository<typeof catalogType> {
   constructor(db: NodePgDatabase) {
      super(catalogType, db);
   }
}
