import { Injectable } from '@nestjs/common';
import { FileMetadata, StorageService, UploadOptions, UploadResult } from './storage.interface';

@Injectable()
export class S3StorageService implements StorageService {
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    throw new Error('Method not implemented.');
  }
  delete(key: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  exists(key: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  getMetadata(key: string): Promise<FileMetadata | null> {
    throw new Error('Method not implemented.');
  }
}
