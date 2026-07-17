import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const fallbackUrl =
  'postgresql://odontogest_owner:local-placeholder@localhost:5432/odontogest';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url:
      process.env.MIGRATION_DATABASE_URL ??
      process.env.DATABASE_URL ??
      fallbackUrl,
  },
});
