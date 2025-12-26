import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvConfig } from '@config/env.validation';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import type {
  StorageService,
  UploadOptions,
  UploadResult,
  FileMetadata,
} from './storage.interface';
import * as crypto from 'crypto';

/**
 * Local Storage Implementation
 *
 * Stores files on local filesystem (development/testing)
 * Production should use S3StorageService instead
 */
@Injectable()
export class LocalStorageService implements StorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService<EnvConfig, true>) {
    // Upload directory: ./uploads (relative to project root)
    this.uploadDir = path.join(process.cwd(), 'uploads');

    // Base URL for accessing files (e.g., http://localhost:3000/uploads)
    const apiPort = this.config.get('API_PORT', { infer: true });
    this.baseUrl = `http://localhost:${apiPort}/uploads`;

    // Ensure upload directory exists
    this.ensureUploadDir();

    this.logger.log(`Local storage initialized: ${this.uploadDir}`);
  }

  /**
   * Upload file to local filesystem
   */
  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    try {
      // Build full file path
      const fullPath = path.join(this.uploadDir, options.key);

      // Ensure directory exists
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });

      // Write file to disk
      await fs.writeFile(fullPath, buffer);

      // Build public URL
      const url = `${this.baseUrl}/${options.key}`;

      this.logger.debug(`File uploaded: ${options.key}`);

      return {
        key: options.key,
        url,
        size: buffer.length,
        etag: this.generateEtag(buffer),
      };
    } catch (error) {
      this.logger.error('Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Delete file from local filesystem
   */
  async delete(key: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, key);

      // Check if file exists
      if (fsSync.existsSync(fullPath)) {
        await fs.unlink(fullPath);
        this.logger.debug(`File deleted: ${key}`);
      } else {
        this.logger.warn(`File not found for deletion: ${key}`);
      }
    } catch (error) {
      this.logger.error('Failed to delete file:', error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, key);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getMetadata(key: string): Promise<FileMetadata | null> {
    try {
      const fullPath = path.join(this.uploadDir, key);
      const stats = await fs.stat(fullPath);

      return {
        size: stats.size,
        contentType: this.guessContentType(key),
        lastModified: stats.mtime,
        metadata: {},
      };
    } catch {
      return null;
    }
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Ensure upload directory exists
   */
  private ensureUploadDir(): void {
    if (!fsSync.existsSync(this.uploadDir)) {
      fsSync.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Generate ETag (simple MD5 hash)
   */
  private generateEtag(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  /**
   * Guess content type from file extension
   */
  private guessContentType(key: string): string {
    const ext = path.extname(key).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Extract key from URL (for migration from old local paths)
   */
  extractKeyFromUrl(url: string): string | null {
    if (url.startsWith(this.baseUrl)) {
      return url.replace(`${this.baseUrl}/`, '');
    }
    return null;
  }
}
