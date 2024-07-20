import { service, serviceSchema } from '../../models/clinic/service_model';
import { ServiceRepository } from '../../repository/clinic/service_repository';
import { BaseClinicService } from '../base_clinic_service';
import boom from '@hapi/boom';

export class ServiceService extends BaseClinicService<typeof service> {
   constructor() {
      super(serviceSchema, ServiceRepository);
   }

}
