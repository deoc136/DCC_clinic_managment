import { Pool } from 'pg';
import { db, hostPool } from '../../../application/drizzle';
import { NewClinic, clinic, clinicSchema } from '../../models/general/clinic_model';
import { ClinicRepository } from '../../repository/general/clinic_repository';
import { BaseService } from '../base_service';
import boom from '@hapi/boom';
import { convertErrorIntoString } from '../../../application/utils';
import { config } from '../../../application/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { NewUser, userSchema } from '../../models/clinic/user_model';
import { NewHeadquarter, headquarterSchema } from '../../models/clinic/headquarter_model';
import { z } from 'zod';

const repository = new ClinicRepository(db);
export class ClinicService extends BaseService<typeof clinic> {
   private static databases: { db: NodePgDatabase; slug: string }[] = [];

   constructor() {
      //@ts-expect-error
      super(repository, clinicSchema);
   }

   async getAllPopulated() {
      const results = await (<ClinicRepository>(this.repository as any)).getAllPopulated();

      return results;
   }

   async getBySlug(slug: string) {
      const results = await repository.getBySlug(slug);

      if (!results.length) {
         throw boom.notFound();
      } else {
         return results.at(0)!;
      }
   }

   async create(data: NewClinic) {
      const parsing = this.schema.safeParse(data);

      if (parsing.success === false) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         (data as any).id = undefined;

         const response = await this.repository.create(parsing.data);

         await ClinicService.createDBIfNotExists(parsing.data.slug);

         return response;
      }
   }

   async createFulfilled(data: {
      clinicData: NewClinic;
      userData: NewUser;
      headquarters: NewHeadquarter[];
   }) {
      const multiSchema = z.object({
         clinicData: clinicSchema,
         userData: userSchema.omit({ cognito_id: true, role: true }),
         headquarters: z.array(headquarterSchema),
      });

      const parsing = multiSchema.safeParse(data);

      if (parsing.success === false) {
         throw boom.badRequest(convertErrorIntoString(parsing));
      } else {
         data.clinicData.id = undefined;

         const response = await repository.createFulfilled(parsing.data as any);

         return response;
      }
   }

   async delete(id: number) {
      const {
         clinic: { slug },
      } = await repository.get(id);

      const response = await this.repository.delete(id);
      try {
         await hostPool.query(`
            DROP TABLE IF EXISTS clinic_${id};
         `);
      } catch (error) {
      }

      if (!response.rowCount) {
         throw boom.notFound();
      } else {
         return response;
      }
   }

   static async createDBIfNotExists(slug: string) {
      if (!this.databases.find(obj => obj.slug === slug)) {
         const results = await repository.getBySlug(slug);

         if (!results.length) {
            throw boom.badRequest(`Clinic with slug '${slug}' doesn't exists`);
         }

         try {
            await hostPool.query(`
            CREATE DATABASE ${results.at(0)!.clinic.id}; 
         `);
         } catch (error) {}

         const pool = new Pool({
            ssl: {
               rejectUnauthorized: false,
            },

            connectionString: `${config.database_url}/clinic_${results.at(0)!.clinic.id}`,
         });

         const db = drizzle(pool);

         ClinicService.addNewPool({ db, slug });

         await migrate(db, {
            migrationsFolder: 'src/application/drizzle/clinic',
         });
      }
   }

   static addNewPool(data: (typeof this.databases)[number]) {
      this.databases.push(data);
   }

   static async getPoolBySlug(slug: string) {
      let db = this.databases.find(obj => obj.slug === slug);

      if (db) {
         await repository.getBySlug(slug);

         return db;
      }

      await ClinicService.createDBIfNotExists(slug);

      db = this.databases.find(obj => obj.slug === slug);

      if (!db) {
         throw boom.internal();
      } else {
         return db;
      }
   }
}
