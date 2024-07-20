import { rating, ratingSchema } from '../../models/clinic/rating_model';
import { RatingRepository } from '../../repository/clinic/rating_repository';
import { BaseClinicService } from '../base_clinic_service';

export class RatingService extends BaseClinicService<typeof rating> {
   constructor() {
      super(ratingSchema, RatingRepository);
   }

   async getAllByAppointmentId(id: number, slug: string) {
      const results = await (<RatingRepository>(
         (
            await this.getRepositoryFromSlug(slug)
         ).repo
      )).getAllByAppointmentId(id);

      return results;
   }
}
