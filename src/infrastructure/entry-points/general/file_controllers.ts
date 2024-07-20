import express from 'express';
import { z } from 'zod';
import boom from '@hapi/boom';
import { convertErrorIntoString } from '../../../application/utils';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { awsConfig, awsRegion } from '../../../application/config';
import { createControllers } from '../controller_creator';
import { FileService } from '../../../domain/services/general/form_service';

const router = express.Router();

const s3Client = new S3Client(awsConfig);

const bucket = 'agenda-ahora-production';

router.post('/upload', async (req, res, next) => {
   try {
      const fileParser = z.object({
         file: z.object({}),
      });

      const file = (req as any).files?.file;
      const fileName = (req as any).files?.file?.name;

      const parsing = fileParser.safeParse({ file });

      if (parsing.success) {
         await s3Client.send(
            new PutObjectCommand({
               Bucket: bucket,
               Key: `${fileName}`,
               Body: file.data,
               ACL: 'public-read',
            })
         );

         await s3Client.send(
            new GetObjectCommand({
               Bucket: bucket,
               Key: `${fileName}`,
            })
         );

         res.send(
            `https://${bucket}.s3.${awsRegion}.amazonaws.com/${(fileName as string).replaceAll(
               ' ',
               '+'
            )}`
         );
      } else {
         throw boom.badRequest(convertErrorIntoString(parsing));
      }
   } catch (error) {
      next(error);
   }
});

createControllers(new FileService(), router);

export default router;
