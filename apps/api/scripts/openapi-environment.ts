process.env.NODE_ENV ??= 'test';
process.env.APP_ORIGINS ??= 'http://localhost:4200';
process.env.ORIGIN_CHECK_REQUIRED ??= 'false';
process.env.DATABASE_URL ??=
  'postgresql://odontogest_app:local-placeholder@localhost:5432/odontogest';
process.env.REDIS_URL ??= 'memory://openapi';
process.env.ACCESS_TOKEN_SECRET ??= 'not-a-secret-'.repeat(3);
process.env.COOKIE_SECURE ??= 'false';
process.env.COOKIE_NAME ??= 'odontogest_refresh';
process.env.EMAIL_PROVIDER ??= 'fake';
process.env.EMAIL_FROM ??= 'no-reply@localhost.invalid';
process.env.SWAGGER_ENABLED ??= 'false';
