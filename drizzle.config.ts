import type { Config } from 'drizzle-kit';

export default {
   schema: 'src/domain/models/general',
  //  schema: 'src/domain/models/clinic',
   out: 'src/application/drizzle/general',
  //  out: 'src/application/drizzle/clinic',
} satisfies Config;
