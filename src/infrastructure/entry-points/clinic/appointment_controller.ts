import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import { AppointmentService } from '../../../domain/services/clinic/appointment_service';
import boom from '@hapi/boom';
import { noSlugError } from '../../../application/utils';

const router = express.Router();

const service = new AppointmentService();

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

router.get('/getAllByPatientIdWithRating/:id', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const id = Number(req.params['id']);

      if (id) {
         const result = await service.getAllByPatientIdWithRating(id, slug);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

router.get('/getAllWithNames', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const results = await service.getAllWithNames(slug);

      res.send(results);
   } catch (error) {
      next(error);
   }
});

router.post('/createWithPatient', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const object = req.body;

      res.send(await service.createWithPatient(object, slug));
   } catch (error) {
      next(error);
   }
});

router.post('/createMultipleWithPatient', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const object = req.body;

      res.send(await service.createMultipleWithPatient(object, slug));
   } catch (error) {
      next(error);
   }
});

router.post('/cancelById/:id', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const id = Number(req.params['id']);

      if (id) {
         const result = await service.cancelById(id, slug);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

export default router;
