import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import { UserServiceService } from '../../../domain/services/clinic/user_service_service';

const router = express.Router();

const service = new UserServiceService();

createControllers(service, router);

export default router;
