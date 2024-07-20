import { clinicHistorySchema, clinic_history } from '../../models/clinic/clinic_history_model';
import { ClinicHistoryRepository } from '../../repository/clinic/clinic_history_repository';
import { BaseClinicService } from '../base_clinic_service';

export class ClinicHistoryService extends BaseClinicService<typeof clinic_history> {
   constructor() {
      super(clinicHistorySchema, ClinicHistoryRepository);
   }

   async getAllByPatientId(id: number, slug: string) {
      const results = await (<ClinicHistoryRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllByPatientId(id);

      return results;
   }

   async getAllByAppointmentId(id: number, slug: string) {
      const results = await (<ClinicHistoryRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllByAppointmentId(id);

      return results;
   }
}
