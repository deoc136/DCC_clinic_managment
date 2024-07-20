import { AnyPgTable } from 'drizzle-orm/pg-core';
import { eq, InferModel } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export class BaseRepository<TableType extends AnyPgTable<{}>> {
   protected table: TableType;
   protected db: NodePgDatabase;

   protected untypedTable: any;

   constructor(table: TableType, db: NodePgDatabase) {
      this.table = table;
      this.untypedTable = table;
      this.db = db;
   }

   async getAll() {
      return await this.db.select().from(this.table);
   }

   async get(id: number, slug?: string) {
      return await this.db.select().from(this.table).where(eq(this.untypedTable.id, id)).limit(1);
   }

   async create(data: InferModel<TableType, 'insert'>) {
      return (
         await this.db.insert(this.table).values(data).returning({ id: this.untypedTable.id })
      ).at(0);
   }

   async edit(data: InferModel<TableType, 'insert'>) {
      const untypedData = data as any;

      return await this.db
         .update(this.table)
         .set(untypedData)
         .where(eq((this.table as any).id, untypedData.id));
   }

   async delete(id: number) {
      return await this.db.delete(this.table).where(eq(this.untypedTable.id, id));
   }
}
