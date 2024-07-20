import { InferModel } from 'drizzle-orm';
import { catalog, catalogSchema } from '../../models/general/catalog_model';
import { CatalogRepository } from '../../repository/general/catalog_repository';
import { BaseService } from '../base_service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import boom from '@hapi/boom';
import { convertErrorIntoString } from '../../../application/utils';
import { CatalogTypeService } from './catalog_type_service';
import { db } from '../../../application/drizzle';

export class CatalogService extends BaseService<typeof catalog> {
   private catalogTypeService = new CatalogTypeService();

   constructor() {
      //@ts-expect-error
      super(new CatalogRepository(db), catalogSchema);
   }

   async create(data: InferModel<typeof catalog, 'insert'>) {
      const parsing = this.schema.safeParse(data);

      if (parsing.success === false) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         (data as any).id = undefined;

         const promises = Array<Promise<any>>();

         if (data.catalog_type_id) {
            promises.push(this.catalogTypeService.get(Number(parsing.data.catalog_type_id)));
         }

         if (data.parent_catalog_id) {
            promises.push(this.get(Number(parsing.data.parent_catalog_id)));
         }

         await Promise.all(promises);

         try {
            const response = await this.repository.create(parsing.data);
            return response;
         } catch (error) {
            throw error;
         }
      }
   }

   async getByCatalogTypeId(id: number) {
      const results = await (<CatalogRepository>(this.repository as any)).getByCatalogTypeId(id);

      return results;
   }

   async getByParentId(id: number) {
      const results = await (<CatalogRepository>(this.repository as any)).getByParentId(id);

      return results;
   }
}
