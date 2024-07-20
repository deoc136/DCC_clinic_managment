import express, { Router } from 'express';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { config } from '../../application/config';
import { db } from '../../application/drizzle';
import { errorHandler } from '../../application/error_catchers';

import catalogTypeController from './general/catalog_type_controller';
import catalogController from './general/catalog_controller';
import clinicController from './general/clinic_controller';
import softwareOwnerController from './general/software_owner_controller';

import userController from './clinic/user_controller';
import appointmentController from './clinic/appointment_controller';
import ratingController from './clinic/rating_controller';

import clinicHistoryController from './clinic/clinic_history_controller';

import submittedFormController from './clinic/submitted_form_controller';

import headquarterController from './clinic/headquarter_controller';

import formController from './clinic/form_controller';

import serviceController from './clinic/service_controller';
import userServiceController from './clinic/user_service_controller';

import currencyController from './general/currency_controller';
import packageController from './clinic/package_controller';

import scheduleController from './clinic/schedule_controller';

import filesController from './general/file_controllers';
import emailController from './general/email_controller';
import cronController from './general/cron_controller'
import smsController from './general/sms_controller';
import authController from './auth/auth_controller';
import invoiceController from './general/invoice_controller';

import fileUpload from 'express-fileupload';
import cors from 'cors';
import { jwtVerifier, publicEndpoints } from '../../application/utils';

const app = express();
const router = Router();

app.use(express.json());
app.use(fileUpload());

const PORT = config.port;
app.listen(PORT, async () => {
   await migrate(db, { migrationsFolder: 'src/application/drizzle/general' });
   console.log(`Listening in port ${PORT}`);
});

router.use(async (req, _, next) => {
   const { path, headers } = req;

   if (
      headers.security_string === process.env.SECURITY_STRING ||
      publicEndpoints.some(endpoint => path.includes(endpoint))
   ) {
      next();
      return;
   }

   try {
      await jwtVerifier(req);
      next();
   } catch (error) {
      next(error);
   }
});

const corsOptions = {
   origin: [
      'http://localhost:3000',
      'https://agendaahora.com',
      'https://devfront.agendaahora.com',
      'https://www.agendaahora.com',
      'https://www.agendaahora.com/',
   ],
   optionsSuccessStatus: 200,
};

app.use('/api', cors(corsOptions), router);

router.get('/health', async (_, res) => {
   res.send(':)');
});

router.use('/files', filesController);

router.use('/email', emailController);
router.use('/cron', cronController);
router.use('/sms', smsController);

router.use('/catalogType', catalogTypeController);
router.use('/catalog', catalogController);

router.use('/clinic', clinicController);

router.use('/softwareOwner', softwareOwnerController);

router.use('/user', userController);
router.use('/appointment', appointmentController);
router.use('/rating', ratingController);

router.use('/clinicHistory', clinicHistoryController);

router.use('/submittedForm', submittedFormController);

router.use('/headquarter', headquarterController);

router.use('/form', formController);

router.use('/schedule', scheduleController);

router.use('/service', serviceController);
router.use('/userService', userServiceController);

router.use('/currency', currencyController);
router.use('/package', packageController);

router.use('/auth', authController);

router.use('/invoice', invoiceController);

app.use(errorHandler);
