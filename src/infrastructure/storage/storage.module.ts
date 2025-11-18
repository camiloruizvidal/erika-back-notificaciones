import { Module } from '@nestjs/common';
import { FileSystemStorageService } from './file-system-storage.service';

@Module({
  providers: [FileSystemStorageService],
  exports: [FileSystemStorageService],
})
export class StorageModule {}

