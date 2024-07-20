import { AnyPgTable } from 'drizzle-orm/pg-core';
import { BaseService } from '../../domain/services/base_service';
import { Router } from 'express';
import boom from '@hapi/boom';

type methods = 'get' | 'getAll' | 'create' | 'edit' | 'delete';

export function createControllers<TableType extends AnyPgTable<{}>>(
   service: BaseService<TableType>,
   router: Router,
   omittedMethods = new Array<methods>()
) {
   !omittedMethods.includes('get') &&
      router.get('/get/:id', async (req, res, next) => {
         try {
            const id = Number(req.params['id']);

            if (id) {
               const result = await service.get(id);

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
            const results = await service.getAll();

            res.send(results);
         } catch (error) {
            next(error);
         }
      });

   !omittedMethods.includes('create') &&
      router.post('/create', async (req, res, next) => {
         try {
            const object = req.body;

            res.send(await service.create(object));
         } catch (error) {
            next(error);
         }
      });

   !omittedMethods.includes('edit') &&
      router.put('/edit', async (req, res, next) => {
         try {
            const object = req.body;

            await service.edit(object);

            res.send('Edited successfully');
         } catch (error) {
            next(error);
         }
      });

   !omittedMethods.includes('delete') &&
      router.delete('/delete/:id', async (req, res, next) => {
         try {
            const id = Number(req.params['id']);

            if (id) {
               await service.delete(id);

               res.send('Deleted successfully');
            } else {
               throw boom.badRequest('id not valid');
            }
         } catch (error) {
            next(error);
         }
      });
}
