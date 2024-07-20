import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { NewClinic, clinic } from '../../models/general/clinic_model';
import { BaseRepository } from '../base_repository';
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { catalog } from '../../models/general/catalog_model';
import { awsConfig, awsUserPoolId, config } from '../../../application/config';
import {
   AdminDeleteUserCommand,
   CognitoIdentityProviderClient,
   SignUpCommand,
   SignUpCommandInput,
   SignUpCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';
import { generatePassword } from '../../../application/utils';
import { NewHeadquarter, headquarter } from '../../models/clinic/headquarter_model';
import { ClinicService } from '../../services/general/clinic_service';
import { NewUser, user } from '../../models/clinic/user_model';
import boom from '@hapi/boom';
import { hostPool } from '../../../application/drizzle';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

interface createFulfilledProps {
   clinicData: NewClinic;
   headquarters: NewHeadquarter[];
   userData: NewUser;
}

export class ClinicRepository extends BaseRepository<typeof clinic> {
   constructor(db: NodePgDatabase) {
      super(clinic, db);
   }

   //@ts-expect-error
   async get(id: number) {
      const identification_type = alias(catalog, 'identification_type');
      const country = alias(catalog, 'country');

      return (
         await this.db
            .select()
            .from(this.table)
            .where(eq(this.table.id, id))
            .leftJoin(identification_type, eq(this.table.identification_id, identification_type.id))
            .leftJoin(country, eq(this.table.country, country.id))
            .limit(1)
      ).at(0)!;
   }

   async getBySlug(slug: string) {
      const identification_type = alias(catalog, 'identification_type');
      const country = alias(catalog, 'country');

      return await this.db
         .select()
         .from(this.table)
         .where(eq(this.table.slug, slug))
         .leftJoin(identification_type, eq(this.table.identification_id, identification_type.id))
         .leftJoin(country, eq(this.table.country, country.id))
         .limit(1);
   }

   async getAllPopulated() {
      const identification_type = alias(catalog, 'identification_type');
      const country = alias(catalog, 'country');

      return await this.db
         .select()
         .from(this.table)
         .leftJoin(identification_type, eq(this.table.identification_id, identification_type.id))
         .leftJoin(country, eq(this.table.country, country.id));
   }

   async createFulfilled({ clinicData, headquarters, userData }: createFulfilledProps) {
      if ((await this.db.select().from(clinic).where(eq(clinic.slug, clinicData.slug))).length) {
         throw boom.conflict('Theres already an user with this slug.');
      }

      const client = new CognitoIdentityProviderClient(awsConfig);

      const input: SignUpCommandInput = {
         ClientId: config.cognito_user_pool,
         Username: userData.email,
         Password: generatePassword(),
         ClientMetadata: {
            arguments: JSON.stringify({
               slug: clinicData.slug,
            }),
         },
      };

      const command = new SignUpCommand(input);
      let response: SignUpCommandOutput | undefined;

      try {
         response = await client.send(command);
      } catch (error) {
         throw boom.conflict('Theres already an user with this email.');
      }

      let clinic_id = undefined as undefined | number;
      await this.db.transaction(async tx => {
         try {
            clinic_id = (
               await tx
                  .insert(clinic)
                  .values({
                     ...clinicData,
                     administrator_id: response!.UserSub,
                  })
                  .returning({ id: clinic.id })
            ).at(0)?.id;

            try {
               await hostPool.query(`
                  CREATE DATABASE clinic_${clinic_id};
               `);
            } catch (error) {
               throw error;
            }

            const pool = new Pool({
               ssl: {
                  rejectUnauthorized: false,
               },

               connectionString: `${config.database_url}/clinic_${clinic_id}`,
            });

            const db = drizzle(pool);

            ClinicService.addNewPool({ db, slug: clinicData.slug });

            await migrate(db, {
               migrationsFolder: 'src/application/drizzle/clinic',
            });

            (await ClinicService.getPoolBySlug(clinicData.slug)).db.transaction(async tx2 => {
               try {
                  const aux = headquarters.map(
                     async quarter => await tx2.insert(headquarter).values(quarter)
                  );

                  Promise.all([
                     ...aux,
                     tx2.insert(user).values({
                        ...userData,
                        cognito_id: response!.UserSub!,
                        role: 'ADMINISTRATOR',
                     }),
                  ]);
               } catch (error) {
                  tx2.rollback();

                  throw Error;
               }
            });
         } catch (error) {

            try {
               tx.rollback();
            } catch (error) {}

            const input = {
               UserPoolId: config.cognito_user_pool,
               Username: userData.email,
            };
            const command = new AdminDeleteUserCommand(input);
            await client.send(command);

            throw error;
         }
      });

      return {
         id: clinic_id,
      };
   }
}
