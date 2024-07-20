import { BaseRepository } from '../base_repository';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { rating } from '../../models/clinic/rating_model';
import { eq } from 'drizzle-orm';

export class RatingRepository extends BaseRepository<typeof rating> {
   constructor(db: NodePgDatabase) {
      super(rating, db);
   }

   async getAllByAppointmentId(id: number) {
      return await this.db.select().from(this.table).where(eq(this.table.appointment_id, id));
   }
}
