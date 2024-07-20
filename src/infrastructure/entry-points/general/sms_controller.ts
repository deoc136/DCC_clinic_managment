import express from 'express';
import { awsConfig } from '../../../application/config';
import { z } from 'zod';
import boom from '@hapi/boom';
import { convertErrorIntoString } from '../../../application/utils';
import { PublishCommand, PublishCommandInput, SNSClient } from '@aws-sdk/client-sns';

const router = express.Router();

const snsClient = new SNSClient(awsConfig);

export const sendSMS = async (Message: string, PhoneNumber:string) => {
   const input: PublishCommandInput = {
      PhoneNumber,
      Message,
      MessageAttributes: {
         'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'String',
         },
      },
   };

   const command = new PublishCommand(input);
   await snsClient.send(command);
}

router.post('/send', async (req, res, next) => {
   try {
      const schema = z.object({
         PhoneNumber: z.string().nonempty(),
         Message: z.string().nonempty(),
      });

      const parsing = schema.safeParse(req.body);

      if (parsing.success) {

         const { Message, PhoneNumber } = parsing.data;
         await sendSMS(Message, PhoneNumber)
         res.send('Message sent');
      } else {
         throw boom.badRequest(convertErrorIntoString(parsing));
      }
   } catch (error) {
      next(error);
   }
});

export default router;
