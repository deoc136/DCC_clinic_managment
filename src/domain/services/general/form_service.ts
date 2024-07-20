import { db } from '../../../application/drizzle';
import { file, fileSchema } from '../../models/general/file_model';
import { FileRepository } from '../../repository/general/file_repository';
import { BaseService } from '../base_service';

export class FileService extends BaseService<typeof file> {
   constructor() {
      super(new FileRepository(db), fileSchema);
   }
}
