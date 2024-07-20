import boom from '@hapi/boom';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { InferModel } from 'drizzle-orm';
import { BaseRepository } from '../repository/base_repository';
import { convertErrorIntoString } from '../../application/utils';
import { createInsertSchema } from 'drizzle-zod';

export class BaseService<TableType extends AnyPgTable<{}>> {
   protected repository: BaseRepository<TableType>;
   protected schema: ReturnType<typeof createInsertSchema<TableType>>;

   constructor(
      repository: BaseRepository<TableType>,
      model: ReturnType<typeof createInsertSchema<TableType>>
   ) {
      this.repository = repository;
      this.schema = model;
   }

   async get(id: number) {
      const results = await this.repository.get(id);

      if (!results.length) {
         throw boom.notFound();
      } else {
         return results.at(0);
      }
   }

   async getAll() {
      const results = await this.repository.getAll();

      return results;
   }

   async create(data: InferModel<TableType, 'insert'>) {
      const parsing = this.schema.safeParse(data);

      if (parsing.success === false) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         (data as any).id = undefined;

         const response = await this.repository.create(parsing.data);
         return response;
      }
   }

   async edit(data: InferModel<TableType, 'insert'>) {
      const parsing = this.schema.safeParse(data);
      if (parsing.success === false) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         const response = await this.repository.edit(parsing.data);

         if (!response.rowCount) {
            throw boom.notFound();
         } else {
            return response;
         }
      }
   }

   async delete(id: number) {
      const response = await this.repository.delete(id);

      if (!response.rowCount) {
         throw boom.notFound();
      } else {
         return response;
      }
   }
}
