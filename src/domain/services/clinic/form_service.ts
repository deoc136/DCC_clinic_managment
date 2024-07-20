import { form, formSchema } from '../../models/clinic/form_model';
import { FormRepository } from '../../repository/clinic/form_repository';
import { BaseClinicService } from '../base_clinic_service';

export class FormService extends BaseClinicService<typeof form> {
   constructor() {
      super(formSchema, FormRepository);
   }
}
