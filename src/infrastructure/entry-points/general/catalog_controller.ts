import express from 'express';
import { createControllers } from '../controller_creator';
import { CatalogService } from '../../../domain/services/general/catalog_service';
import boom from '@hapi/boom';

const router = express.Router();

const service = new CatalogService();

router.get('/getByTypeId/:id', async (req, res, next) => {
   try {
      const id = Number(req.params['id']);

      if (id) {
         const result = await service.getByCatalogTypeId(id);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

router.get('/getByParentId/:id', async (req, res, next) => {
   try {
      const id = Number(req.params['id']);

      if (id) {
         const result = await service.getByParentId(id);

         res.send(result);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

createControllers(service, router);

export default router;
