import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import boom from '@hapi/boom';
import { RatingService } from '../../../domain/services/clinic/rating_service';
import { noSlugError } from '../../../application/utils';

const router = express.Router();

const ratingService = new RatingService();

createControllers(ratingService, router);

router.get('/getAllByAppointmentId/:id', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const id = Number(req.params['id']);

      if (id) {
         const result = await ratingService.getAllByAppointmentId(id, slug);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

export default router;
