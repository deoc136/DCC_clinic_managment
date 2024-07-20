import { eq } from 'drizzle-orm';
import { catalog } from '../../models/general/catalog_model';
import { catalogType } from '../../models/general/catalog_type_model';
import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export class CatalogRepository extends BaseRepository<typeof catalog> {
   constructor(db: NodePgDatabase) {
      super(catalog, db);
   }

   //@ts-expect-error
   async get(id: number) {
      return await this.db
         .select()
         .from(this.table)
         .where(eq(this.table.id, id))
         .leftJoin(catalogType, eq(this.table.catalog_type_id, catalogType.id))
         .limit(1);
   }

   async getByCatalogTypeId(id: number) {
      return await this.db.select().from(this.table).where(eq(this.table.catalog_type_id, id));
   }

   async getByParentId(id: number) {
      return await this.db.select().from(this.table).where(eq(this.table.parent_catalog_id, id));
   }
}
