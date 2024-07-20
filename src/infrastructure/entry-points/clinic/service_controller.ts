import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import { ServiceService } from '../../../domain/services/clinic/service_service';

const router = express.Router();

const service = new ServiceService();

createControllers(service, router);

export default router;
