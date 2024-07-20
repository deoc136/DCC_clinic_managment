import { userServiceSchema, user_service } from '../../models/clinic/user_service_model';
import { UserServiceRepository } from '../../repository/clinic/user_service_repository';
import { BaseClinicService } from '../base_clinic_service';

export class UserServiceService extends BaseClinicService<typeof user_service> {
   constructor() {
      super(userServiceSchema, UserServiceRepository);
   }
}
