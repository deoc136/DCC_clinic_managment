import { db } from '../../../application/drizzle';
import { currency, currencySchema } from '../../models/general/currency_model';
import { CurrencyRepository } from '../../repository/general/currency_repository';
import { BaseService } from '../base_service';

export class CurrencyService extends BaseService<typeof currency> {
   constructor() {
      super(new CurrencyRepository(db), currencySchema);
   }
}
