import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { SwaggerModule } from '@nestjs/swagger';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import type { AppEnvironment } from './config/environment';
import { createOpenApiDocument } from './openapi';

export function configureApplication(
  app: INestApplication,
  config: ConfigService<AppEnvironment, true>,
): void {
  const origins = new Set(config.get('APP_ORIGINS', { infer: true }));
  const production = config.get('NODE_ENV', { infer: true }) === 'production';
  const swaggerEnabled = config.get('SWAGGER_ENABLED', { infer: true });

  app.setGlobalPrefix('api/v1');
  app.use(json({ limit: '256kb' }));
  app.use(urlencoded({ extended: false, limit: '64kb', parameterLimit: 100 }));
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: swaggerEnabled
        ? false
        : {
            directives: {
              defaultSrc: ["'none'"],
              frameAncestors: ["'none'"],
              baseUri: ["'none'"],
              formAction: ["'none'"],
            },
          },
      hsts: production
        ? { maxAge: 31_536_000, includeSubDomains: true, preload: false }
        : false,
      referrerPolicy: { policy: 'no-referrer' },
      frameguard: { action: 'deny' },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  app.enableCors({
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'authorization',
      'content-type',
      'x-request-id',
      'x-idempotency-key',
    ],
    exposedHeaders: ['x-request-id'],
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) => {
      callback(null, !origin || origins.has(origin));
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      validationError: { target: false, value: false },
    }),
  );
  app.useGlobalFilters(new ApiExceptionFilter());
  app.enableShutdownHooks();

  if (swaggerEnabled) {
    SwaggerModule.setup('api/docs', app, createOpenApiDocument(app), {
      swaggerOptions: { persistAuthorization: false },
    });
  }
}
