import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '../config';

export const hostPool = new Pool({
   ssl: {
      rejectUnauthorized: false,
   },

   connectionString: config.database_url,
});

export const basePool = new Pool({
   ssl: {
      rejectUnauthorized: false,
   },

   connectionString: `${config.database_url}/terapias`,
});

export const db = drizzle(basePool);
