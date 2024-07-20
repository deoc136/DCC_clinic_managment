import { AnyPgTable } from 'drizzle-orm/pg-core';
import { Router } from 'express';
import boom from '@hapi/boom';
import { BaseClinicService } from '../../domain/services/base_clinic_service';
import { noSlugError } from '../../application/utils';

type methods = 'get' | 'getAll' | 'create' | 'edit' | 'delete';

export function createControllers<TableType extends AnyPgTable<{}>>(
   service: BaseClinicService<TableType>,
   router: Router,
   omittedMethods = new Array<methods>()
) {
   !omittedMethods.includes('get') &&
      router.get('/get/:id', async (req, res, next) => {
         try {
            const slug = req.headers.slug;

            if (typeof slug !== 'string') {
               throw boom.badRequest(noSlugError);
            }

            const id = Number(req.params['id']);

            if (id) {
               const result = await service.get(id, slug);

               res.send(result);
            } else {
               throw boom.badRequest('id not valid');
            }
         } catch (error) {
            next(error);
         }
      });

   !omittedMethods.includes('getAll') &&
      router.get('/getAll', async (req, res, next) => {
         try {
            const slug = req.headers.slug;

            if (typeof slug !== 'string') {
               throw boom.badRequest(noSlugError);
            }

            const results = await service.getAll(slug);

            res.send(results);
         } catch (error) {
            next(error);
         }
      });

   !omittedMethods.includes('create') &&
      router.post('/create', async (req, res, next) => {
         try {
            const slug = req.headers.slug;

            if (typeof slug !== 'string') {
               throw boom.badRequest(noSlugError);
            }

            const object = req.body;

            res.send(await service.create(object, slug));
         } catch (error) {
            next(error);
         }
      });

   !omittedMethods.includes('edit') &&
      router.put('/edit', async (req, res, next) => {
         try {
            const slug = req.headers.slug;

            if (typeof slug !== 'string') {
               throw boom.badRequest(noSlugError);
            }

            const object = req.body;

            await service.edit(object, slug);

            res.send('Edited successfully');
         } catch (error) {
            next(error);
         }
      });

   !omittedMethods.includes('delete') &&
      router.delete('/delete/:id', async (req, res, next) => {
         try {
            const slug = req.headers.slug;

            if (typeof slug !== 'string') {
               throw boom.badRequest(noSlugError);
            }

            const id = Number(req.params['id']);

            if (id) {
               await service.delete(id, slug);

               res.send('Deleted successfully');
            } else {
               throw boom.badRequest('id not valid');
            }
         } catch (error) {
            next(error);
         }
      });
}
