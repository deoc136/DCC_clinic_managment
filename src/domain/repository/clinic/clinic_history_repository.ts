import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { clinic_history } from '../../models/clinic/clinic_history_model';
import { eq } from 'drizzle-orm';

export class ClinicHistoryRepository extends BaseRepository<typeof clinic_history> {
   constructor(db: NodePgDatabase) {
      super(clinic_history, db);
   }

   async getAllByPatientId(id: number) {
      return await this.db.select().from(this.table).where(eq(this.table.patient_id, id));
   }

   async getAllByAppointmentId(id: number) {
      return await this.db.select().from(this.table).where(eq(this.table.appointment_id, id));
   }
}
