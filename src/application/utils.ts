import CryptoJS from 'crypto-js';
import { SafeParseError } from 'zod';
import { awsUserPoolId, config } from './config';
import axios from 'axios';
import { ClinicService } from '../domain/services/general/clinic_service';
import { IClinic } from '../domain/models/general/clinic_model';
import { Request } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import boom from '@hapi/boom';

export const paypal_url = 'https://api.sandbox.paypal.com';

export function convertErrorIntoString<T>(error: SafeParseError<T>) {
   const aux: any = {};
   error.error.errors.forEach(error => (aux[`${error.path}`] = error.message));

   return JSON.stringify(aux);
}

export function encrypt(string: string) {
   return CryptoJS.AES.encrypt(string, config.encrypt_string).toString();
}

export function generatePassword() {
   const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   const passwordLength = 30;
   let password = '';

   for (let i = 0; i <= passwordLength; i++) {
      let randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber + 1);
   }

   return password;
}

export const noSlugError = 'The clinic slug is left in the headers';

export async function getClinicAccessToken(clinic: IClinic) {
   const params = new URLSearchParams();
   params.append('grant_type', 'client_credentials');

   const {
      data: { access_token },
   } = await axios.post(`${paypal_url}/v1/oauth2/token`, params, {
      auth: {
         username: clinic.paypal_id,
         password: clinic.paypal_secret_key,
      },
   });

   return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
   };
}

export async function jwtVerifier(req: Request) {
   const jwt = req.headers.authorization;

   const verifier = CognitoJwtVerifier.create({
      userPoolId: awsUserPoolId,
      tokenUse: 'access',
      clientId: config.cognito_user_pool,
   });

   try {
      await verifier.verify(jwt ?? '');
   } catch {
      throw boom.unauthorized();
   }
}

export const publicEndpoints = [
   'user/create',
   'user/signUp',
   'user/edit',
   '/get',
   '/health',
   'auth/assign-password',
];
