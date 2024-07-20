import express from 'express';
import {
   PinpointEmailClient,
   SendEmailCommand,
   SendEmailCommandInput,
} from '@aws-sdk/client-pinpoint-email';
import { awsConfig } from '../../../application/config';
import { z } from 'zod';
import boom from '@hapi/boom';
import { convertErrorIntoString } from '../../../application/utils';

const router = express.Router();

const emailClient = new PinpointEmailClient(awsConfig);

export const sendEmailData = async (fromEmail: string, destinationEmails: string[], subject:string, content:string) => {
   const input: SendEmailCommandInput = {
      FromEmailAddress: fromEmail,
      Destination: {
         ToAddresses: destinationEmails,
      },
      Content: {
         Simple: {
            Subject: {
               Data: subject,
               Charset: 'UTF-8',
            },
            Body: {
               Html: {
                  Data: content,
                  Charset: 'UTF-8',
               },
            },
         },
      },
   };

   const command = new SendEmailCommand(input);
   await emailClient.send(command);
}

router.post('/send', async (req, res, next) => {
   try {
      const schema = z.object({
         fromEmail: z.string().nonempty().email(),
         destinationEmails: z.array(z.string().nonempty().email()),
         content: z.string().nonempty(),
         subject: z.string().nonempty(),
      });

      const parsing = schema.safeParse(req.body);

      if (parsing.success) {
         await sendEmailData(parsing.data.fromEmail, parsing.data.destinationEmails, parsing.data.subject, parsing.data.content)
         res.send('Email send');
      } else {
         throw boom.badRequest(convertErrorIntoString(parsing));
      }
   } catch (error) {
      next(error);
   }
});

export default router;
