import { NestFactory } from '@nestjs/core';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { AppModule } from '../src/app.module';
import { createOpenApiDocument } from '../src/openapi';

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  app.setGlobalPrefix('api/v1');
  const output = resolve(process.cwd(), 'openapi/openapi.json');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(
    output,
    JSON.stringify(createOpenApiDocument(app), null, 2),
    'utf8',
  );
  await app.close();
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
