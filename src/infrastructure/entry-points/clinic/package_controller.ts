import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import { PackageService } from '../../../domain/services/clinic/package_service';
import boom from '@hapi/boom';
import { noSlugError } from '../../../application/utils';

const router = express.Router();

const service = new PackageService();

createControllers(service, router);

router.get('/getAllByServiceId/:id', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const id = Number(req.params['id']);

      if (id) {
         const result = await service.getAllByServiceId(slug, id);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

export default router;
