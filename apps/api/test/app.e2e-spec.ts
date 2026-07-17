import { type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaPg } from '@prisma/adapter-pg';
import type { Server } from 'node:http';
import request, { type Response } from 'supertest';
import { z } from 'zod';
import { AppModule } from '../src/app.module';
import type { AppEnvironment } from '../src/config/environment';
import { configureApplication } from '../src/configure-application';
import {
  MembershipStatus,
  PrismaClient,
  RoleCode,
  UserStatus,
} from '../src/generated/prisma/client';
import { CryptoService } from '../src/modules/auth/crypto.service';
import { FirebaseIdentityService } from '../src/modules/auth/firebase-identity.service';
import { PrismaService } from '../src/platform/database/prisma.service';
import { FakeEmailService } from '../src/platform/email/fake-email.service';

const WEB_ORIGIN = 'http://localhost:4200';
const COOKIE_NAME = 'odontogest_refresh';
const loginResponseSchema = z.object({
  accessToken: z.string().min(20),
  activeClinicId: z.string().uuid().nullable(),
  user: z.object({ id: z.string().uuid(), email: z.string().email() }),
});
const onboardingResponseSchema = z.object({
  clinicId: z.string().uuid(),
  created: z.boolean(),
  verificationRequired: z.literal(true),
});
const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
  }),
});

function requireEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} é obrigatória para os testes E2E.`);
  return value;
}

function cookieFrom(response: Response): string {
  const value = response.headers['set-cookie'] as unknown;
  const header = Array.isArray(value)
    ? value.find(
        (item): item is string =>
          typeof item === 'string' && item.startsWith(`${COOKIE_NAME}=`),
      )
    : typeof value === 'string'
      ? value
      : undefined;
  if (!header) throw new Error('Cookie de refresh ausente na resposta.');
  return header.split(';', 1)[0];
}

function tokenFromLink(link: string): string {
  const token = new URL(link).searchParams.get('token');
  if (!token) throw new Error('Token ausente no link de teste.');
  return token;
}

describe('OdontoGest foundation (e2e)', () => {
  const firebaseIdentity = {
    verifyIdToken: jest.fn(),
    verifyIdTokenForOnboarding: jest.fn(),
  };
  let app: INestApplication;
  let server: Server;
  let owner: PrismaClient;
  let runtimePrisma: PrismaService;
  let fakeEmail: FakeEmailService;
  let crypto: CryptoService;

  async function cleanData(): Promise<void> {
    await owner.securityEvent.deleteMany();
    await owner.auditLog.deleteMany();
    await owner.termsAcceptance.deleteMany();
    await owner.refreshSession.deleteMany();
    await owner.emailVerificationToken.deleteMany();
    await owner.passwordResetToken.deleteMany();
    await owner.clinicMembership.deleteMany();
    await owner.clinicSettings.deleteMany();
    await owner.outboxEvent.deleteMany();
    await owner.clinic.deleteMany();
    await owner.user.deleteMany();
  }

  async function createTenantFixture(label: string): Promise<{
    userId: string;
    clinicId: string;
  }> {
    const passwordHash = await crypto.hashPassword(
      `Fixture-${label}-password-2026!`,
    );
    const role = await owner.role.findUniqueOrThrow({
      where: { code: RoleCode.OWNER },
      select: { id: true },
    });
    const user = await owner.user.create({
      data: {
        name: `Usuário ${label}`,
        email: `${label.toLowerCase()}@fixture.example.test`,
        emailCanonical: `${label.toLowerCase()}@fixture.example.test`,
        passwordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      select: { id: true },
    });
    const clinic = await owner.clinic.create({
      data: {
        legalName: `Clínica ${label} Ltda.`,
        tradeName: `Clínica ${label}`,
        settings: { create: { createdBy: user.id, updatedBy: user.id } },
      },
      select: { id: true },
    });
    await owner.clinicMembership.create({
      data: {
        clinicId: clinic.id,
        userId: user.id,
        roleId: role.id,
        status: MembershipStatus.ACTIVE,
        acceptedAt: new Date(),
      },
    });
    return { userId: user.id, clinicId: clinic.id };
  }

  beforeAll(async () => {
    const ownerUrl = requireEnvironment('MIGRATION_DATABASE_URL');
    requireEnvironment('DATABASE_URL');
    owner = new PrismaClient({
      adapter: new PrismaPg({ connectionString: ownerUrl }),
    });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FirebaseIdentityService)
      .useValue(firebaseIdentity)
      .compile();
    app = moduleFixture.createNestApplication({ bodyParser: false });
    configureApplication(
      app,
      app.get<ConfigService<AppEnvironment, true>>(ConfigService),
    );
    await app.init();
    server = app.getHttpServer() as Server;
    runtimePrisma = app.get(PrismaService);
    fakeEmail = app.get(FakeEmailService);
    crypto = app.get(CryptoService);
    await cleanData();
  });

  afterAll(async () => {
    await cleanData();
    await app.close();
    await owner.$disconnect();
  });

  it('expõe liveness e readiness sem autenticação', async () => {
    const live = await request(server).get('/api/v1/health/live').expect(200, {
      status: 'ok',
    });
    expect(live.headers['x-content-type-options']).toBe('nosniff');
    expect(live.headers['x-frame-options']).toBe('DENY');
    expect(live.headers['x-request-id']).toEqual(expect.any(String));
    await request(server).get('/api/v1/health/ready').expect(200);

    const blocked = await request(server)
      .post('/api/v1/auth/signup')
      .set('Origin', 'https://origem-invalida.example')
      .send({
        name: 'Origem Inválida',
        email: 'origem-invalida@example.test',
        password: 'Senha-forte-de-origem-2026!',
      })
      .expect(403);
    expect(errorResponseSchema.parse(blocked.body as unknown).error.code).toBe(
      'INVALID_ORIGIN',
    );
  });

  it('provisiona o onboarding Firebase uma única vez', async () => {
    const email = 'onboarding@fase1.example.test';
    firebaseIdentity.verifyIdTokenForOnboarding.mockResolvedValue({
      uid: 'firebase-onboarding-owner',
      email,
      emailVerified: false,
    });
    const input = {
      idToken: 'firebase-onboarding-token'.padEnd(100, '-'),
      responsibleName: 'Responsável Onboarding',
      clinicName: 'Clínica Onboarding',
      acceptTerms: true,
    };

    const first = await request(server)
      .post('/api/v1/auth/firebase/onboarding')
      .set('Origin', WEB_ORIGIN)
      .send(input)
      .expect(201);
    const firstBody = onboardingResponseSchema.parse(first.body as unknown);
    expect(firstBody).toEqual(
      expect.objectContaining({ created: true, verificationRequired: true }),
    );

    const second = await request(server)
      .post('/api/v1/auth/firebase/onboarding')
      .set('Origin', WEB_ORIGIN)
      .send(input)
      .expect(201);
    const secondBody = onboardingResponseSchema.parse(second.body as unknown);
    expect(secondBody).toEqual(
      expect.objectContaining({
        clinicId: firstBody.clinicId,
        created: false,
      }),
    );

    const user = await owner.user.findUniqueOrThrow({
      where: { firebaseUid: 'firebase-onboarding-owner' },
      include: {
        memberships: true,
        termsAcceptances: true,
      },
    });
    expect(user.passwordHash).toBe('!firebase-managed!');
    expect(user.memberships).toHaveLength(1);
    expect(user.termsAcceptances).toHaveLength(2);
    expect(
      await owner.clinic.count({
        where: { memberships: { some: { userId: user.id } } },
      }),
    ).toBe(1);
  });

  it('protege o ciclo de conta, rotação de refresh e autorização', async () => {
    const email = 'proprietaria@fase1.example.test';
    const oldPassword = 'Senha-forte-inicial-2026!';
    const newPassword = 'Senha-forte-renovada-2026!';

    await request(server)
      .post('/api/v1/auth/signup')
      .set('Origin', WEB_ORIGIN)
      .send({ name: 'Marina Souza', email, password: oldPassword })
      .expect(202);
    await request(server)
      .post('/api/v1/auth/signup')
      .set('Origin', WEB_ORIGIN)
      .send({ name: 'Outro Nome', email, password: oldPassword })
      .expect(202);
    expect(
      fakeEmail
        .getMessagesForTesting()
        .filter((message) => message.type === 'EMAIL_VERIFICATION'),
    ).toHaveLength(1);

    const verificationMessage = fakeEmail
      .getMessagesForTesting()
      .find((message) => message.type === 'EMAIL_VERIFICATION');
    expect(verificationMessage).toBeDefined();
    await request(server)
      .post('/api/v1/auth/email/verify')
      .set('Origin', WEB_ORIGIN)
      .send({ token: tokenFromLink(verificationMessage!.link) })
      .expect(204);

    const user = await owner.user.findUniqueOrThrow({
      where: { emailCanonical: email },
      select: { id: true },
    });
    const ownerRole = await owner.role.findUniqueOrThrow({
      where: { code: RoleCode.OWNER },
      select: { id: true },
    });
    const receptionistRole = await owner.role.findUniqueOrThrow({
      where: { code: RoleCode.RECEPTIONIST },
      select: { id: true },
    });
    const clinic = await owner.clinic.create({
      data: {
        legalName: 'Odontologia Marina Ltda.',
        tradeName: 'Odontologia Marina',
        settings: { create: { createdBy: user.id, updatedBy: user.id } },
      },
      select: { id: true },
    });
    const membership = await owner.clinicMembership.create({
      data: {
        userId: user.id,
        clinicId: clinic.id,
        roleId: ownerRole.id,
        status: MembershipStatus.ACTIVE,
        acceptedAt: new Date(),
      },
      select: { id: true },
    });

    firebaseIdentity.verifyIdToken.mockResolvedValueOnce({
      uid: 'firebase-uid-marina',
      email,
      emailVerified: true,
    });
    const firebaseLogin = await request(server)
      .post('/api/v1/auth/firebase/session')
      .set('Origin', WEB_ORIGIN)
      .send({ idToken: 'firebase-test-token'.padEnd(100, '-') })
      .expect(200);
    expect(loginResponseSchema.parse(firebaseLogin.body as unknown)).toEqual(
      expect.objectContaining({ activeClinicId: clinic.id }),
    );
    await expect(
      owner.user.findUniqueOrThrow({
        where: { id: user.id },
        select: { firebaseUid: true },
      }),
    ).resolves.toEqual({ firebaseUid: 'firebase-uid-marina' });

    const login = await request(server)
      .post('/api/v1/auth/login')
      .set('Origin', WEB_ORIGIN)
      .send({ email, password: oldPassword })
      .expect(200);
    const loginBody = loginResponseSchema.parse(login.body as unknown);
    expect(loginBody.activeClinicId).toBe(clinic.id);
    const originalRefreshCookie = cookieFrom(login);

    await request(server)
      .get('/api/v1/auth/sessions')
      .set('Authorization', `Bearer ${loginBody.accessToken}`)
      .expect(200);
    await request(server)
      .get('/api/v1/audit')
      .set('Authorization', `Bearer ${loginBody.accessToken}`)
      .expect(200);

    await owner.clinicMembership.update({
      where: { id: membership.id },
      data: {
        roleId: receptionistRole.id,
        authorizationVersion: { increment: 1 },
      },
    });
    await request(server)
      .get('/api/v1/audit')
      .set('Authorization', `Bearer ${loginBody.accessToken}`)
      .expect(403);

    const refreshed = await request(server)
      .post('/api/v1/auth/refresh')
      .set('Origin', WEB_ORIGIN)
      .set('Cookie', originalRefreshCookie)
      .expect(200);
    const replacementRefreshCookie = cookieFrom(refreshed);
    expect(replacementRefreshCookie).not.toBe(originalRefreshCookie);

    await request(server)
      .post('/api/v1/auth/refresh')
      .set('Origin', WEB_ORIGIN)
      .set('Cookie', originalRefreshCookie)
      .expect(401);
    await request(server)
      .post('/api/v1/auth/refresh')
      .set('Origin', WEB_ORIGIN)
      .set('Cookie', replacementRefreshCookie)
      .expect(401);

    const concurrentLogin = await request(server)
      .post('/api/v1/auth/login')
      .set('Origin', WEB_ORIGIN)
      .send({ email, password: oldPassword })
      .expect(200);
    const concurrentCookie = cookieFrom(concurrentLogin);
    const concurrentRefreshes = await Promise.all([
      request(server)
        .post('/api/v1/auth/refresh')
        .set('Origin', WEB_ORIGIN)
        .set('Cookie', concurrentCookie),
      request(server)
        .post('/api/v1/auth/refresh')
        .set('Origin', WEB_ORIGIN)
        .set('Cookie', concurrentCookie),
    ]);
    expect(
      concurrentRefreshes.map((response) => response.status).sort(),
    ).toEqual([200, 401]);
    const concurrentSuccess = concurrentRefreshes.find(
      (response) => response.status === 200,
    );
    expect(concurrentSuccess).toBeDefined();
    await request(server)
      .post('/api/v1/auth/refresh')
      .set('Origin', WEB_ORIGIN)
      .set('Cookie', cookieFrom(concurrentSuccess!))
      .expect(401);

    fakeEmail.clearForTesting();
    await request(server)
      .post('/api/v1/auth/password/forgot')
      .set('Origin', WEB_ORIGIN)
      .send({ email })
      .expect(202);
    const resetMessage = fakeEmail
      .getMessagesForTesting()
      .find((message) => message.type === 'PASSWORD_RESET');
    expect(resetMessage).toBeDefined();
    await request(server)
      .post('/api/v1/auth/password/reset')
      .set('Origin', WEB_ORIGIN)
      .send({ token: tokenFromLink(resetMessage!.link), password: newPassword })
      .expect(204);

    await request(server)
      .post('/api/v1/auth/login')
      .set('Origin', WEB_ORIGIN)
      .send({ email, password: oldPassword })
      .expect(401);
    await request(server)
      .post('/api/v1/auth/login')
      .set('Origin', WEB_ORIGIN)
      .send({ email, password: newPassword })
      .expect(200);
  });

  it('impede acesso entre tenants mesmo com contexto de clínica adulterado', async () => {
    const tenantA = await createTenantFixture('TenantA');
    const tenantB = await createTenantFixture('TenantB');

    const [privileges] = await runtimePrisma.withSecurityContext(
      { userId: tenantA.userId, clinicId: tenantA.clinicId },
      (transaction) =>
        transaction.$queryRaw<
          Array<{ canUpdateRoles: boolean; canDeleteAudit: boolean }>
        >`
          SELECT
            has_table_privilege(current_user, 'public.roles', 'UPDATE') AS "canUpdateRoles",
            has_table_privilege(current_user, 'public.audit_logs', 'DELETE') AS "canDeleteAudit"
        `,
    );
    expect(privileges).toEqual({
      canUpdateRoles: false,
      canDeleteAudit: false,
    });

    const ownSettings = await runtimePrisma.withSecurityContext(
      { userId: tenantA.userId, clinicId: tenantA.clinicId },
      (transaction) =>
        transaction.clinicSettings.findUnique({
          where: { clinicId: tenantA.clinicId },
        }),
    );
    expect(ownSettings?.clinicId).toBe(tenantA.clinicId);

    const crossTenantRead = await runtimePrisma.withSecurityContext(
      { userId: tenantA.userId, clinicId: tenantA.clinicId },
      (transaction) =>
        transaction.clinicSettings.findUnique({
          where: { clinicId: tenantB.clinicId },
        }),
    );
    expect(crossTenantRead).toBeNull();

    const forgedContextRead = await runtimePrisma.withSecurityContext(
      { userId: tenantB.userId, clinicId: tenantA.clinicId },
      (transaction) =>
        transaction.clinicSettings.findUnique({
          where: { clinicId: tenantA.clinicId },
        }),
    );
    expect(forgedContextRead).toBeNull();
  });
});
