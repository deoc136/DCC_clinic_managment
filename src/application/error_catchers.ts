import { Boom } from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
const fs = require('fs');

export function parsingFailHandler(err: any, _: Request, res: Response, _next: NextFunction) {
   res.status(err.status).send(err.type);
}

export function errorHandler(err: Boom, req: Request, res: Response, _next: NextFunction) {
   if (err.isBoom) {
      let errors: string;

      try {
         errors = JSON.parse(err.output.payload.message);
      } catch (error) {
         errors = err.output.payload.message;
      }

      res.status(err.output.statusCode).json({
         errors,
         data: req.body,
      });
   } else {
      const error = err as any;

      if (error.detail) {
         res.status(error.status ?? 400).json({
            message: error.detail,
            data: req.body,
         });

         return;
      }

      console.log(error);
      logError(error)
      res.status(error.status ?? 500).json({
         message: error.type ?? 'Internal server error',
         data: req.body,
      });
   }

   // next(error);
}

function logError(error: any) {
   const timestamp = new Date().toISOString();
   const logMessage = `[${timestamp}] ${error}\n`;

   fs.appendFile('errors.log', logMessage, (err: any) => {
       if (err) {
           console.error('Error al guardar el error en el archivo:', err);
       }
   });
}
