import express from 'express';
import { createControllers } from '../controller_creator';
import { ClinicService } from '../../../domain/services/general/clinic_service';
import boom from '@hapi/boom';

const router = express.Router();

const service = new ClinicService();

router.get('/getBySlug/:slug', async (req, res, next) => {
   try {
      const slug = req.params['slug'];

      if (slug) {
         const result = await service.getBySlug(slug);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

router.get('/getAllPopulated', async (req, res, next) => {
   try {
      const results = await service.getAllPopulated();

      res.send(results);
   } catch (error) {
      next(error);
   }
});

router.post('/createFulfilled', async (req, res, next) => {
   try {
      const results = await service.createFulfilled(req.body);

      res.send(results);
   } catch (error) {
      next(error);
   }
});

createControllers(service, router);

export default router;
