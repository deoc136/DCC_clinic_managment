import { currency } from '../../models/general/currency_model';
import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export class CurrencyRepository extends BaseRepository<typeof currency> {
   constructor(db: NodePgDatabase) {
      super(currency, db);
   }
}
