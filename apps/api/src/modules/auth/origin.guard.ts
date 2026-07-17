import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppEnvironment } from '../../config/environment';

@Injectable()
export class OriginGuard implements CanActivate {
  private readonly required: boolean;
  private readonly allowedOrigins: ReadonlySet<string>;

  constructor(config: ConfigService<AppEnvironment, true>) {
    this.required = config.get('ORIGIN_CHECK_REQUIRED', { infer: true });
    this.allowedOrigins = new Set(config.get('APP_ORIGINS', { infer: true }));
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return true;

    const origin = request.get('origin');
    if (!origin && !this.required) return true;
    if (origin && this.allowedOrigins.has(origin)) return true;

    throw new ForbiddenException({
      error: 'INVALID_ORIGIN',
      message: 'Origem da solicitação não autorizada.',
    });
  }
}
