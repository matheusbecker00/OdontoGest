import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('OdontoGest API')
    .setDescription(
      'API REST versionada do OdontoGest. Não contém dados reais.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .addCookieAuth('__Secure-odontogest_refresh', {
      type: 'apiKey',
      in: 'cookie',
    })
    .build();
  return SwaggerModule.createDocument(app, config, {
    operationIdFactory: (_c, method) => method,
  });
}
