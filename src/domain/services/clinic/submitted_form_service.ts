import { submittedFormSchema, submitted_form } from '../../models/clinic/submitted_form_model';
import { SubmittedFormRepository } from '../../repository/clinic/submitted_form_repository';
import { BaseClinicService } from '../base_clinic_service';

export class SubmittedFormService extends BaseClinicService<typeof submitted_form> {
   constructor() {
      super(submittedFormSchema, SubmittedFormRepository);
   }

   async getAllByPatientId(id: number, slug: string) {
      const results = await (<SubmittedFormRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllByPatientId(id);

      return results;
   }
}
