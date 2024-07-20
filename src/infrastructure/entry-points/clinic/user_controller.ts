import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import { UserService } from '../../../domain/services/clinic/user_service';
import boom from '@hapi/boom';
import { Role, roles } from '../../../domain/models/clinic/user_model';
import { noSlugError } from '../../../application/utils';

const router = express.Router();

const userService = new UserService();

router.get('/get/:id', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const id = Number(req.params['id']);

      if (id) {
         const result = await userService.get(id, slug);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

router.get('/getByCognitoId/:cognitoId', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const id = req.params['cognitoId'];

      if (id) {
         const result = await userService.getByCognitoId(slug, id);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

router.get('/getFullFilledById/:id', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const id = Number(req.params['id']);

      if (id) {
         const result = await userService.getFullFilledById(slug, id);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

router.get('/getTherapistsByServiceId/:id', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const id = Number(req.params['id']);

      if (id) {
         const result = await userService.getTherapistsByServiceId(slug, id);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

router.get('/getAll', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const results = await userService.getAll(slug);

      res.send(results);
   } catch (error) {
      next(error);
   }
});

router.get('/getAllPatients', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const results = await userService.getAllPatients(slug);

      res.send(results);
   } catch (error) {
      next(error);
   }
});

router.get('/getAllByRole/:role', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const role = req.params['role'];

      if (roles.includes(role as any)) {
         const results = await userService.getAllByRole(role as Role, slug);

         res.send(results);
      } else {
         throw boom.badRequest(`The role should be one of these: ${roles.join(', ')}.`);
      }
   } catch (error) {
      next(error);
   }
});

router.post('/createFullFilled', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const object = req.body;

      res.send(await userService.createFullFilled(object, slug));
   } catch (error) {
      next(error);
   }
});

router.post('/signUp', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const object = req.body;

      res.send(await userService.signUp(object, slug));
   } catch (error) {
      next(error);
   }
});

router.get('/getAllTherapists', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const results = await userService.getAllTherapists(slug);

      res.send(results);
   } catch (error) {
      next(error);
   }
});

createControllers(userService, router, ['get', 'getAll']);

export default router;
