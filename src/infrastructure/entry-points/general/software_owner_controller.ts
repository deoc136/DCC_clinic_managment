import express from 'express';
import { createControllers } from '../controller_creator';
import { SoftwareOwnerService } from '../../../domain/services/general/software_owner_service';
import boom from '@hapi/boom';

const router = express.Router();

const softwareOwnerService = new SoftwareOwnerService();

router.get('/getByCognitoId/:cognitoId', async (req, res, next) => {
   try {
      const cognitoId = req.params['cognitoId'];

      if (cognitoId) {
         const results = await softwareOwnerService.getByCognitoId(cognitoId);

         res.send(results);
      } else {
         throw boom.badRequest('id not valid');
      }
   } catch (error) {
      next(error);
   }
});

createControllers(softwareOwnerService, router);

export default router;
