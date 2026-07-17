import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const environmentSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'staging', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    APP_ORIGINS: z
      .string()
      .min(1)
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      )
      .pipe(z.array(z.url()).min(1)),
    ORIGIN_CHECK_REQUIRED: booleanString.default(true),
    DATABASE_URL: z.string().min(1),
    TEST_DATABASE_RUNTIME_ROLE: z
      .string()
      .regex(/^[a-z_][a-z0-9_]{2,62}$/)
      .optional(),
    REDIS_URL: z.string().min(1),
    FIREBASE_PROJECT_ID: z.string().min(1),
    FIREBASE_CLIENT_EMAIL: z.email().optional(),
    FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
    FIREBASE_AUTH_CHECK_REVOKED: booleanString.default(true),
    ACCESS_TOKEN_SECRET: z.string().min(32),
    ACCESS_TOKEN_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(60)
      .max(900)
      .default(300),
    REFRESH_TOKEN_IDLE_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(3600)
      .max(2_592_000)
      .default(2_592_000),
    REFRESH_TOKEN_ABSOLUTE_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(86_400)
      .max(7_776_000)
      .default(7_776_000),
    COOKIE_SECURE: booleanString.default(false),
    COOKIE_NAME: z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{2,79}$/),
    EMAIL_PROVIDER: z.enum(['fake']).default('fake'),
    EMAIL_FROM: z.email(),
    SWAGGER_ENABLED: booleanString.default(false),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
  })
  .superRefine((value, context) => {
    if (
      (value.FIREBASE_CLIENT_EMAIL === undefined) !==
      (value.FIREBASE_PRIVATE_KEY === undefined)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['FIREBASE_CLIENT_EMAIL'],
        message:
          'FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY devem ser configuradas juntas.',
      });
    }

    if (
      value.NODE_ENV === 'production' &&
      (!value.FIREBASE_CLIENT_EMAIL || !value.FIREBASE_PRIVATE_KEY)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['FIREBASE_CLIENT_EMAIL'],
        message: 'Credenciais do Firebase Admin são obrigatórias na Vercel.',
      });
    }

    if (
      value.REFRESH_TOKEN_ABSOLUTE_TTL_SECONDS <
      value.REFRESH_TOKEN_IDLE_TTL_SECONDS
    ) {
      context.addIssue({
        code: 'custom',
        path: ['REFRESH_TOKEN_ABSOLUTE_TTL_SECONDS'],
        message:
          'A expiração absoluta não pode ser menor que a expiração ociosa.',
      });
    }

    if (value.NODE_ENV === 'production' && !value.COOKIE_SECURE) {
      context.addIssue({
        code: 'custom',
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE deve ser true em produção.',
      });
    }

    if (
      value.NODE_ENV === 'production' &&
      !value.COOKIE_NAME.startsWith('__Secure-')
    ) {
      context.addIssue({
        code: 'custom',
        path: ['COOKIE_NAME'],
        message: 'COOKIE_NAME deve usar o prefixo __Secure- em produção.',
      });
    }

    if (value.NODE_ENV === 'production' && value.SWAGGER_ENABLED) {
      context.addIssue({
        code: 'custom',
        path: ['SWAGGER_ENABLED'],
        message: 'SWAGGER_ENABLED deve ser false em produção.',
      });
    }

    if (value.NODE_ENV === 'production' && value.EMAIL_PROVIDER === 'fake') {
      context.addIssue({
        code: 'custom',
        path: ['EMAIL_PROVIDER'],
        message: 'O provedor fake de e-mail não pode ser usado em produção.',
      });
    }

    if (
      value.NODE_ENV !== 'test' &&
      value.TEST_DATABASE_RUNTIME_ROLE !== undefined
    ) {
      context.addIssue({
        code: 'custom',
        path: ['TEST_DATABASE_RUNTIME_ROLE'],
        message: 'TEST_DATABASE_RUNTIME_ROLE só pode ser usado em testes.',
      });
    }
  });

export type AppEnvironment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  input: Record<string, unknown>,
): AppEnvironment {
  return environmentSchema.parse(input);
}
