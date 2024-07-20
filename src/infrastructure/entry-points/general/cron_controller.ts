import express from 'express';
import { createControllers } from '../controller_creator';
import { ClinicService } from '../../../domain/services/general/clinic_service';
import { z } from 'zod';
import boom from '@hapi/boom';
import schedule from 'node-schedule';
import { cutFullName } from '../../utils/utils';
import { sendEmailData } from './email_controller';
import { sendSMS } from './sms_controller';
import { sendWhatsAppMessage } from '../../utils/whatsapp';
import { jobs } from '../../utils/jobs';
import { convertErrorIntoString } from '../../../application/utils';
import moment from 'moment-timezone';
import { sendMail, sendMessages } from '../../utils/notifications';
import { UserService } from '../../../domain/services/clinic/user_service';

const router = express.Router();

const service = new ClinicService();


router.post('/notification', async (req, res, next) => {
   try {
      const schema = z.object({
         date: z.string().nonempty(),
         patient: z.object({
           names: z.string().nonempty(),
           last_names: z.string().nonempty(),
           phone: z.string().nonempty(),
           email: z.string().nonempty().email(),
         }),
         headquarter: z.object({
           name: z.string().nonempty(),
         }),
         therapist: z.object({
           names: z.string().nonempty(),
           last_names: z.string().nonempty(),
         }),
         clinic: z.object({
            name: z.string().nonempty(),
            slug: z.string().nonempty(),
            profile_picture_url: z.string(),
         }),
         phoneCode: z.string().nonempty(),
         hour: z.string().nonempty(),
         schedule: z.string().nonempty(),
         timezone: z.string().nonempty(),
         appointmentId: z.number(),
       });
      
      const parsing = schema.safeParse(req.body);
   
      if (parsing.success) {
         const timezone = parsing.data.timezone
         // Desactivate UTC para pruebas locales
         const scheduleDate = moment.tz(parsing.data.schedule, timezone).utc().format('YYYY-MM-DDTHH:mm:ss')
         console.log({
            'tz': Intl.DateTimeFormat().resolvedOptions().timeZone,
            'tz_front': timezone,
            'now': new Date(),
            'job': scheduleDate
         })
         const job = schedule.scheduleJob(scheduleDate, async () => {
            console.log('Execute job')
            
            await Promise.all([
               await sendMail(
                  parsing.data.clinic,
                  new Date(parsing.data.date),
                  parsing.data.patient,
                  parsing.data.headquarter,
                  parsing.data.therapist,
                  parsing.data.hour
               ),
               await sendMessages(
                  parsing.data.clinic,
                  new Date(parsing.data.date),
                  parsing.data.patient,
                  parsing.data.headquarter,
                  parsing.data.therapist,
                  parsing.data.phoneCode,
                  parsing.data.hour
               )
            ])
         })

         const clinicJobs = jobs.get(parsing.data.clinic.slug);

         if (clinicJobs) {
            clinicJobs.push({ appointmentId: parsing.data.appointmentId, job });
         } else {
            jobs.set(parsing.data.clinic.slug, [{ appointmentId: parsing.data.appointmentId, job }]);
         }
         res.send('Cron Job Done!');
      } else {
         throw boom.badRequest(convertErrorIntoString(parsing));
      }
   } catch (error) {
      console.log('error', error)
      next(error);
   }
});

const userService = new UserService();

router.post('/status-user', async (req, res, next) => {
   try {
      const schema = z.object({
         id: z.number(),
         deactivation_date: z.string().nonempty(),
         activation_date: z.string().optional(),
         currentTimezone: z.string().nonempty(),
         slug: z.string(),
       });
      
      const parsing = schema.safeParse(req.body);
   
      if (parsing.success) {
         const { deactivation_date, id, slug, activation_date } = parsing.data;
         const timezone = parsing.data.currentTimezone

         try {
            const user = await userService.get(id, slug);
            if (user) {
               // Desactivate UTC para pruebas locales
               const scheduleInactivation = moment.tz(deactivation_date, timezone).utc().format('YYYY-MM-DDTHH:mm:ss')
               schedule.scheduleJob(scheduleInactivation, async date => {
                  try {
                     await userService.edit({...user, enabled: false}, slug)
                  } catch (error) {
                     console.error(error);
                  }
               });

               if (activation_date) {
                  // Desactivate UTC para pruebas locales
                  const scheduleActivation = moment.tz(activation_date, timezone).utc().format('YYYY-MM-DDTHH:mm:ss')
                  schedule.scheduleJob(scheduleActivation, async () => {
                     try {
                        await userService.edit({ ...user, enabled: true }, slug);
                     } catch (error) {
                        console.error(error);
                     }
                  });
               }
            }
            res.send('Cron Change status Job Done!');
         } catch (error) {
            throw "The user doesn't exists";
         }
      } else {
         throw boom.badRequest(convertErrorIntoString(parsing));
      }
   } catch (error) {
      console.log('error', error)
      next(error);
   }
});


router.post('/delete-user', async (req, res, next) => {
   try {
      const schema = z.object({
         id: z.number(),
         deletion_date: z.string().nonempty(),
         currentTimezone: z.string().nonempty(),
         slug: z.string(),
       });
      
      const parsing = schema.safeParse(req.body);
   
      if (parsing.success) {
         const { deletion_date, id, slug, } = parsing.data;
         const timezone = parsing.data.currentTimezone

         try {
            const user = await userService.get(id, slug);
            if (user) {
               // Desactivate UTC para pruebas locales
               const scheduleDeletedUser = moment.tz(deletion_date, timezone).utc().format('YYYY-MM-DDTHH:mm:ss')
               schedule.scheduleJob(scheduleDeletedUser, async date => {
                  try {
                     await userService.edit({...user, retired: true}, slug)
                  } catch (error) {
                     console.error(error);
                  }
               });
            }
            res.send('Cron Change Deleted Job Done!');
         } catch (error) {
            throw "The user doesn't exists";
         }
      } else {
         throw boom.badRequest(convertErrorIntoString(parsing));
      }
   } catch (error) {
      console.log('error', error)
      next(error);
   }
});

createControllers(service, router);

export default router;
