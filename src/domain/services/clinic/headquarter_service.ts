import { headquarter, headquarterSchema } from '../../models/clinic/headquarter_model';
import { HeadquarterRepository } from '../../repository/clinic/headquarter_repository';
import { BaseClinicService } from '../base_clinic_service';

export class HeadquarterService extends BaseClinicService<typeof headquarter> {
   constructor() {
      super(headquarterSchema, HeadquarterRepository);
   }
}
