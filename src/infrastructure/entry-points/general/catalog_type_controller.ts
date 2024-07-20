import express from 'express';
import { CatalogTypeService } from '../../../domain/services/general/catalog_type_service';
import { createControllers } from '../controller_creator';

const router = express.Router();

createControllers(new CatalogTypeService(), router);

export default router;
