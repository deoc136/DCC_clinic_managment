import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import boom from '@hapi/boom';
import { SubmittedFormService } from '../../../domain/services/clinic/submitted_form_service';
import { noSlugError } from '../../../application/utils';

const router = express.Router();

const service = new SubmittedFormService();

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

export default router;
