import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import { HeadquarterService } from '../../../domain/services/clinic/headquarter_service';

const router = express.Router();

createControllers(new HeadquarterService(), router);

export default router;
