import express from 'express';
import { createControllers } from '../clinic_controller_creator';
import { FormService } from '../../../domain/services/clinic/form_service';

const router = express.Router();

createControllers(new FormService(), router);

export default router;
