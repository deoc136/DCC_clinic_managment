import { ZodObject, ZodRawShape } from 'zod';
import boom from '@hapi/boom';
import { AnyPgTable } from 'drizzle-orm/pg-core';
import { InferModel } from 'drizzle-orm';
import { BaseRepository } from '../repository/base_repository';
import { convertErrorIntoString } from '../../application/utils';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ClinicService } from './general/clinic_service';
import { createInsertSchema } from 'drizzle-zod';

interface IBaseRepository<TableType extends AnyPgTable<{}>> {
   new (db: NodePgDatabase): BaseRepository<TableType>;
}

export class BaseClinicService<TableType extends AnyPgTable<{}>> {
   protected repositories: { slug: string; repo: BaseRepository<TableType> }[] = [];
   protected schema: ReturnType<typeof createInsertSchema<TableType>>;
   protected baseRepository: IBaseRepository<TableType>;

   constructor(
      model: ReturnType<typeof createInsertSchema<TableType>>,
      baseRepository: IBaseRepository<TableType>
   ) {
      this.baseRepository = baseRepository;
      this.schema = model;
   }

   async getRepositoryFromSlug(slug: string) {
      let repo = this.repositories.find(repo => repo.slug === slug);

      if (repo) {
         return repo;
      } else {
         repo = {
            slug,
            repo: new this.baseRepository((await ClinicService.getPoolBySlug(slug)).db),
         };

         this.repositories.push(repo);

         return repo;
      }
   }

   async get(id: number, slug: string) {
      const results = await (await this.getRepositoryFromSlug(slug)).repo.get(id);

      if (!results.length) {
         throw boom.notFound();
      } else {
         return results.at(0);
      }
   }

   async getAll(slug: string) {
      const results = await (await this.getRepositoryFromSlug(slug)).repo.getAll();

      return results;
   }

   async create(data: InferModel<TableType, 'insert'>, slug: string) {
      const parsing = this.schema.safeParse(data);

      if (parsing.success === false) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         (data as any).id = undefined;

         const response = await (await this.getRepositoryFromSlug(slug)).repo.create(parsing.data);
         return response;
      }
   }

   async edit(data: InferModel<TableType, 'insert'>, slug: string) {
      const parsing = this.schema.safeParse(data);
      if (parsing.success === false) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         const response = await (await this.getRepositoryFromSlug(slug)).repo.edit(parsing.data);

         if (!response.rowCount) {
            throw boom.notFound();
         } else {
            return response;
         }
      }
   }

   async delete(id: number, slug: string) {
      const response = await (await this.getRepositoryFromSlug(slug)).repo.delete(id);

      if (!response.rowCount) {
         throw boom.notFound();
      } else {
         return response;
      }
   }
}
