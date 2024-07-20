import { packageSchema, service_package } from '../../models/clinic/package_model';
import { PackageRepository } from '../../repository/clinic/package_repository';
import { BaseClinicService } from '../base_clinic_service';

export class PackageService extends BaseClinicService<typeof service_package> {
   constructor() {
      super(packageSchema, PackageRepository);
   }

   async getAllByServiceId(slug: string, id: number) {
      const results = await (<PackageRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllByServiceId(id);

      return results;
   }
}
