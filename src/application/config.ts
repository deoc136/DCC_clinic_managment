import { CognitoJwtVerifier } from 'aws-jwt-verify';
import dotenv from 'dotenv';

dotenv.config();

export const config = {
   port: process.env.PORT || 8080,
   database_url: process.env.DATABASE_URL || '',
   encrypt_string: process.env.ENCRYPT_STRING || '',
   aws_accessKey_id: process.env.AWS_ACCESS_kEY_ID || '',
   aws_secret_accessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
   cognito_user_pool: process.env.COGNITO_CLIENT_ID || '',
};

export const awsRegion = 'us-east-1';

export const awsUserPoolId = 'us-east-1_zb29yvXj6';

export const awsConfig = {
   region: awsRegion,
   credentials: {
      accessKeyId: config.aws_accessKey_id,
      secretAccessKey: config.aws_secret_accessKey,
   },
};
