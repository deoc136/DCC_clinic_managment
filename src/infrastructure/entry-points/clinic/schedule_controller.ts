import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import { ScheduleService } from '../../../domain/services/clinic/schedule_service';
import boom from '@hapi/boom';
import { noSlugError } from '../../../application/utils';

const router = express.Router();

const service = new ScheduleService();

createControllers(service as any, router, ['create']);

router.post('/create', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const object = req.body;

      res.send(await service.create(object, slug));
   } catch (error) {
      next(error);
   }
});

export default router;
