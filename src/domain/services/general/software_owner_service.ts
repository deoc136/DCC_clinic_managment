import { db } from '../../../application/drizzle';
import { software_owner, softwareOwnerSchema } from '../../models/general/software_owner_model';
import { SoftwareOwnerRepository } from '../../repository/general/software_owner_repository';
import { BaseService } from '../base_service';
import boom from '@hapi/boom';

export class SoftwareOwnerService extends BaseService<typeof software_owner> {
   constructor() {
      super(new SoftwareOwnerRepository(db), softwareOwnerSchema);
   }

   async getByCognitoId(id: string) {
      const results = await (<SoftwareOwnerRepository>this.repository).getByCognitoId(id);

      if (!results.length) {
         throw boom.notFound();
      } else {
         return results.at(0);
      }
   }
}
