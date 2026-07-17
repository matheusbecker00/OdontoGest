import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import type { AppEnvironment } from './config/environment';
import { configureApplication } from './configure-application';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
  app.useLogger(app.get(Logger));
  const config = app.get<ConfigService<AppEnvironment, true>>(ConfigService);
  configureApplication(app, config);
  await app.listen(config.get('PORT', { infer: true }), '0.0.0.0');
}

void bootstrap();
