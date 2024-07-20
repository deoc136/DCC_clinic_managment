import { db } from '../../../application/drizzle';
import { catalogType, catalogTypeSchema } from '../../models/general/catalog_type_model';
import { CatalogTypeRepository } from '../../repository/general/catalog_type_repository';
import { BaseService } from '../base_service';

export class CatalogTypeService extends BaseService<typeof catalogType> {
   constructor() {
      super(new CatalogTypeRepository(db), catalogTypeSchema);
   }
}
