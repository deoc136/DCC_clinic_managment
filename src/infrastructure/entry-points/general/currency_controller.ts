import express from 'express';
import { CurrencyService } from '../../../domain/services/general/currency_service';
import { createControllers } from '../controller_creator';

const router = express.Router();

createControllers(new CurrencyService(), router);

export default router;
