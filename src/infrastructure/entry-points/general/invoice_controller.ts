import express from 'express';
import { z } from 'zod';
import boom from '@hapi/boom';
import {
   convertErrorIntoString,
   getClinicAccessToken,
   noSlugError,
   paypal_url,
} from '../../../application/utils';
import axios from 'axios';
import { ClinicService } from '../../../domain/services/general/clinic_service';
import { NewInvoice } from '../../../application/types/invoices';

const router = express.Router();

const schema = z.object({
   services_name: z.string().nonempty(),
   services_quantity: z.number().min(0),
   price: z.number(),
});

const clinicService = new ClinicService();

router.post('/create', async (req, res, next) => {
   try {
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      const parsing = schema.safeParse(req.body);

      if (parsing.success) {
         const { clinic } = await clinicService.getBySlug(slug);

         const headers = await getClinicAccessToken(clinic);

         const { price, services_name, services_quantity } = parsing.data;

         const {
            data: { href },
         } = await axios.post(
            `${paypal_url}/v2/invoicing/invoices`,
            {
               detail: {
                  currency_code: 'USD',
                  note: 'Gracias por tu compra, recuerda descargar el PDF de la transacción para corroborar el pago el día de la cita.',
                  payment_term: {
                     term_type: 'NO_DUE_DATE',
                  },
               },
               invoicer: {
                  name: {
                     given_name: clinic.name,
                  },
                  website: `https://agendaahora.comm/${clinic.slug}/patient/services`,
                  logo_url: clinic.profile_picture_url,
               },
               items: [
                  {
                     unit_of_measure: 'AMOUNT',
                     quantity: '1',
                     name: `${services_name} - ${services_quantity} sesiones`,
                     unit_amount: {
                        currency_code: 'USD',
                        value: price.toString(),
                     },
                  },
               ],
            } satisfies NewInvoice,
            { headers }
         );

         const {
            data: { id },
         } = await axios.get(href, {
            headers,
         });

         const { data } = await axios.post(
            `${paypal_url}/v2/invoicing/invoices/${id}/send`,
            {
               send_to_recipient: false,
            },
            {
               headers,
            }
         );

         res.send({
            id,
            url: data.href,
         });
      } else {
         throw boom.badRequest(convertErrorIntoString(parsing));
      }
   } catch (error) {
      next(error);
   }
});

router.post('/refund/:id', async (req, res, next) => {
   let passed = false;

   try {
      const id = req.params['id'];
      const slug = req.headers.slug;

      if (typeof slug !== 'string') {
         throw boom.badRequest(noSlugError);
      }

      if (!id) {
         throw boom.badRequest('id not valid');
      }

      const { clinic } = await clinicService.getBySlug(slug);

      passed = true;

      const headers = await getClinicAccessToken(clinic);

      try {
         await axios.post(
            `${paypal_url}/v2/payments/captures/${id}/refund`,
            {},
            {
               headers,
            }
         );
      } catch (error) {
         throw boom.badRequest('Unprocessable entity for paypal');
      }

      res.send('Refunded successfully.');
   } catch (error) {
      next(passed ? error : boom.badRequest('The slug or the id is invalid.'));
   }
});

export default router;
