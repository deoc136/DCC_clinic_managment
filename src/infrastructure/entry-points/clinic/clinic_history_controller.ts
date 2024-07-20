import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import { ClinicHistoryService } from '../../../domain/services/clinic/clinic_history_service';
import boom from '@hapi/boom';
import { noSlugError } from '../../../application/utils';

const router = express.Router();

const service = new ClinicHistoryService();

createControllers(service, router);

router.get('/getAllByPatientId/:id', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const id = Number(req.params['id']);

      if (id) {
         const result = await service.getAllByPatientId(id, slug);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

router.get('/getAllByAppointmentId/:id', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const id = Number(req.params['id']);

      if (id) {
         const result = await service.getAllByAppointmentId(id, slug);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

export default router;
