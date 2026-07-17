import { MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { validateEnvironment, type AppEnvironment } from './config/environment';
import { RequestIdMiddleware } from './common/http/request-id.middleware';
import { PrismaModule } from './platform/database/prisma.module';
import { RateLimitModule } from './platform/rate-limit/rate-limit.module';
import { EmailModule } from './platform/email/email.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { AccessTokenGuard } from './modules/auth/access-token.guard';
import { AuthorizationGuard } from './modules/auth/authorization.guard';
import { HealthModule } from './modules/health/health.module';
import { TenancyModule } from './modules/tenancy/tenancy.module';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnvironment, true>) => ({
        pinoHttp: {
          level: config.get('LOG_LEVEL', { infer: true }),
          genReqId: (request: IncomingMessage, response: ServerResponse) => {
            const raw = request.headers['x-request-id'];
            const candidate = Array.isArray(raw) ? raw[0] : raw;
            const id =
              candidate && REQUEST_ID_PATTERN.test(candidate)
                ? candidate
                : randomUUID();
            response.setHeader('x-request-id', id);
            return id;
          },
          redact: {
            censor: '[REDACTED]',
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'res.headers.set-cookie',
              'req.body.password',
              'req.body.token',
              'req.body.idToken',
              'req.body.email',
              'req.body.cpf',
              'req.body.cnpj',
              'req.body.phone',
              'req.body.whatsapp',
              'req.body.address',
            ],
          },
          serializers: {
            req: (request: IncomingMessage & { id?: unknown }) => ({
              id:
                typeof request.id === 'string' || typeof request.id === 'number'
                  ? request.id
                  : undefined,
              method: request.method,
              url: request.url?.split('?')[0],
            }),
          },
        },
      }),
    }),
    PrismaModule,
    RateLimitModule,
    EmailModule,
    AuditModule,
    AuthModule,
    TenancyModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AccessTokenGuard },
    { provide: APP_GUARD, useClass: AuthorizationGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
