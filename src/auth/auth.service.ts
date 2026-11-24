import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get('apiKey');
  }

  validateApiKey(apiKey: string): boolean {
    if (!this.apiKey || !apiKey) {
      return false;
    }

    const expected = Buffer.from(this.apiKey);
    const provided = Buffer.from(apiKey);

    if (expected.length !== provided.length) {
      return false;
    }

    return timingSafeEqual(expected, provided);
  }
}
