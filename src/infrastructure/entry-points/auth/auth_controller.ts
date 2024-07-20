import {
   AdminSetUserPasswordCommand,
   CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import express from 'express';
import { awsConfig, awsUserPoolId } from '../../../application/config';
import { z } from 'zod';
import { passwordRegex } from '../../../application/regex';
import boom from '@hapi/boom';
import { convertErrorIntoString } from '../../../application/utils';

const router = express.Router();

router.post('/assign-password', async (req, res, next) => {
   try {
      const requestSchema = z.object({
         email: z.string().nonempty().email(),
         newPassword: z
            .string()
            .nonempty()
            .regex(passwordRegex, 'The password has unmet requirements'),
      });

      const data = req.body;

      const parsing = requestSchema.safeParse(data);

      if (parsing.success) {
         const client = new CognitoIdentityProviderClient(awsConfig);
         const input = {
            UserPoolId: awsUserPoolId,
            Username: parsing.data.email,
            Password: parsing.data.newPassword,
            Permanent: true,
         };

         const command = new AdminSetUserPasswordCommand(input);
         await client.send(command);

         res.send('Contraseña asignada exitosamente');
      } else {
         throw boom.badRequest(convertErrorIntoString(parsing));
      }
   } catch (error) {
      next(error);
   }
});

export default router;