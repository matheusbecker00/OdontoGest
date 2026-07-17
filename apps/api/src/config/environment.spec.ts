import { validateEnvironment } from './environment';

const baseEnvironment = {
  NODE_ENV: 'development',
  APP_ORIGINS: 'http://localhost:4200',
  ORIGIN_CHECK_REQUIRED: 'true',
  DATABASE_URL: 'postgresql://runtime@localhost:5432/odontogest',
  REDIS_URL: 'redis://localhost:6379/0',
  ACCESS_TOKEN_SECRET: 'not-a-secret-'.repeat(3),
  COOKIE_SECURE: 'false',
  COOKIE_NAME: 'odontogest_refresh',
  EMAIL_PROVIDER: 'fake',
  EMAIL_FROM: 'no-reply@localhost.invalid',
  SWAGGER_ENABLED: 'false',
};

describe('validateEnvironment', () => {
  it('aceita cookie sem prefixo seguro somente fora de produção', () => {
    expect(validateEnvironment(baseEnvironment).COOKIE_NAME).toBe(
      'odontogest_refresh',
    );
  });

  it('exige cookie seguro, prefixado e Swagger desativado em produção', () => {
    expect(() =>
      validateEnvironment({
        ...baseEnvironment,
        NODE_ENV: 'production',
        SWAGGER_ENABLED: 'true',
      }),
    ).toThrow();
  });

  it('restringe a troca de papel do banco ao ambiente de teste', () => {
    expect(() =>
      validateEnvironment({
        ...baseEnvironment,
        TEST_DATABASE_RUNTIME_ROLE: 'odontogest_test_app',
      }),
    ).toThrow();
  });
});
