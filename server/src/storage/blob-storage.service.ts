import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put, del } from '@vercel/blob';
import { extname } from 'path';
import { isBlobUrl } from '../utils/profile-image.util';

@Injectable()
export class BlobStorageService {
  private readonly logger = new Logger(BlobStorageService.name);
  private readonly token: string;

  constructor(private readonly config: ConfigService) {
    const raw = this.config.get<string>('BLOB_READ_WRITE_TOKEN') ?? '';
    this.token = raw.replace(/^["']|["']$/g, '').trim();
  }

  private assertConfigured(): void {
    if (!this.token) {
      throw new InternalServerErrorException(
        'File storage is not configured (BLOB_READ_WRITE_TOKEN)',
      );
    }
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    this.assertConfigured();

    const ext = extname(file.originalname) || '.jpg';
    const pathname = `profiles/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const blob = await put(pathname, file.buffer, {
      access: 'public',
      token: this.token,
      contentType: file.mimetype || 'application/octet-stream',
    });

    this.logger.log(`Uploaded profile image to blob storage`);
    return blob.url;
  }

  async deleteProfileImage(
    storedValue: string | null | undefined,
  ): Promise<void> {
    if (!storedValue || !isBlobUrl(storedValue) || !this.token) return;

    try {
      await del(storedValue, { token: this.token });
      this.logger.log(`Deleted profile image from blob storage`);
    } catch (err) {
      this.logger.warn(
        `Failed to delete blob (${storedValue}): ${err instanceof Error ? err.message : err}`,
      );
    }
  }
}
