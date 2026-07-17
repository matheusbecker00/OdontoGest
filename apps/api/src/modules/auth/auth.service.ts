import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import type { AppEnvironment } from '../../config/environment';
import type { AuthenticatedPrincipal } from '../../common/http/authenticated-principal';
import type { RequestMetadata } from '../../common/http/request-metadata';
import {
  Prisma,
  MembershipStatus,
  SessionStatus,
  UserStatus,
} from '../../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../platform/database/prisma.service';
import { EmailService } from '../../platform/email/email.service';
import { RateLimitService } from '../../platform/rate-limit/rate-limit.service';
import { AccessTokenService } from './access-token.service';
import { CryptoService } from './crypto.service';
import type {
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
  SignUpDto,
} from './dto/auth.dto';

const GENERIC_CREDENTIAL_ERROR = {
  error: 'INVALID_CREDENTIALS',
  message: 'E-mail ou senha inválidos.',
} as const;

const GENERIC_TOKEN_ERROR = {
  error: 'TOKEN_INVALID_OR_EXPIRED',
  message: 'Token inválido ou expirado.',
} as const;

class RefreshReuseDetectedError extends Error {}

function hasNestedErrorProperty(
  error: unknown,
  property: 'code' | 'kind',
  expected: string,
  depth = 0,
): boolean {
  if (typeof error !== 'object' || error === null || depth > 3) return false;
  const record = error as Record<string, unknown>;
  return (
    record[property] === expected ||
    hasNestedErrorProperty(record['cause'], property, expected, depth + 1)
  );
}

function hasPrismaErrorCode(error: unknown, code: string): boolean {
  return hasNestedErrorProperty(error, 'code', code);
}

function isTransactionWriteConflict(error: unknown): boolean {
  return (
    hasPrismaErrorCode(error, 'P2034') ||
    hasNestedErrorProperty(error, 'kind', 'TransactionWriteConflict')
  );
}

export interface ClinicSummary {
  id: string;
  name: string;
  role: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string };
  clinics: readonly ClinicSummary[];
  activeClinicId: string | null;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  activeClinicId: string | null;
}

@Injectable()
export class AuthService {
  private readonly refreshIdleTtlMs: number;
  private readonly refreshAbsoluteTtlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly accessTokens: AccessTokenService,
    private readonly rateLimits: RateLimitService,
    private readonly email: EmailService,
    private readonly audit: AuditService,
    config: ConfigService<AppEnvironment, true>,
  ) {
    this.refreshIdleTtlMs =
      config.get('REFRESH_TOKEN_IDLE_TTL_SECONDS', { infer: true }) * 1_000;
    this.refreshAbsoluteTtlMs =
      config.get('REFRESH_TOKEN_ABSOLUTE_TTL_SECONDS', { infer: true }) * 1_000;
  }

  private assertPasswordNotPredictable(
    password: string,
    canonicalEmail: string,
  ): void {
    const localPart = canonicalEmail.split('@')[0];
    if (
      localPart.length >= 4 &&
      password.toLocaleLowerCase('pt-BR').includes(localPart)
    ) {
      throw new BadRequestException({
        error: 'PASSWORD_TOO_PREDICTABLE',
        message: 'A senha não pode conter seu e-mail.',
      });
    }
  }

  private expiry(now = new Date()): {
    idleExpiresAt: Date;
    absoluteExpiresAt: Date;
  } {
    const absoluteExpiresAt = new Date(
      now.getTime() + this.refreshAbsoluteTtlMs,
    );
    return {
      idleExpiresAt: new Date(
        Math.min(
          now.getTime() + this.refreshIdleTtlMs,
          absoluteExpiresAt.getTime(),
        ),
      ),
      absoluteExpiresAt,
    };
  }

  private async activeMemberships(
    userId: string,
  ): Promise<readonly ClinicSummary[]> {
    return this.prisma.withSecurityContext({ userId }, async (transaction) => {
      const memberships = await transaction.clinicMembership.findMany({
        where: {
          userId,
          status: MembershipStatus.ACTIVE,
          deletedAt: null,
          clinic: { deletedAt: null },
        },
        orderBy: { createdAt: 'asc' },
        select: {
          clinic: { select: { id: true, tradeName: true } },
          role: { select: { code: true } },
        },
      });
      return memberships.map((membership) => ({
        id: membership.clinic.id,
        name: membership.clinic.tradeName,
        role: membership.role.code,
      }));
    });
  }

  private async hasActiveMembership(
    userId: string,
    clinicId: string,
  ): Promise<boolean> {
    return this.prisma.withSecurityContext({ userId }, async (transaction) => {
      const membership = await transaction.clinicMembership.findFirst({
        where: {
          userId,
          clinicId,
          status: MembershipStatus.ACTIVE,
          deletedAt: null,
        },
        select: { id: true },
      });
      return Boolean(membership);
    });
  }

  async signUp(input: SignUpDto, request: RequestMetadata): Promise<void> {
    const canonicalEmail = this.crypto.normalizeEmail(input.email);
    this.assertPasswordNotPredictable(input.password, canonicalEmail);
    await this.rateLimits.consume(
      'signup-ip',
      request.ipPrefix ?? 'unknown',
      10,
      3_600,
    );
    await this.rateLimits.consume('signup-email', canonicalEmail, 3, 3_600);

    const existing = await this.prisma.user.findUnique({
      where: { emailCanonical: canonicalEmail },
      select: { id: true },
    });
    if (existing) {
      await this.audit.recordSecurity({
        userId: existing.id,
        action: 'SIGNUP_REQUESTED',
        outcome: 'SUCCESS',
        request,
        metadata: { duplicate: true },
      });
      return;
    }

    const [passwordHash, rawToken] = await Promise.all([
      this.crypto.hashPassword(input.password),
      Promise.resolve(this.crypto.randomToken()),
    ]);
    const tokenHash = this.crypto.tokenHash(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1_000);

    let user: { id: string; email: string };
    try {
      user = await this.prisma.$transaction(
        async (transaction) => {
          const created = await transaction.user.create({
            data: {
              name: input.name.trim(),
              email: input.email.trim(),
              emailCanonical: canonicalEmail,
              passwordHash,
            },
            select: { id: true, email: true },
          });
          await transaction.emailVerificationToken.create({
            data: { userId: created.id, tokenHash, expiresAt },
          });
          return created;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (!hasPrismaErrorCode(error, 'P2002')) throw error;
      await this.audit.recordSecurity({
        action: 'SIGNUP_REQUESTED',
        outcome: 'SUCCESS',
        request,
        metadata: {
          duplicate: true,
          accountHash: this.audit.hashIdentifier(canonicalEmail),
        },
      });
      return;
    }

    await this.email.sendEmailVerification(user.email, rawToken);
    await this.audit.recordSecurity({
      userId: user.id,
      action: 'USER_REGISTERED',
      outcome: 'SUCCESS',
      request,
    });
  }

  async verifyEmail(rawToken: string, request: RequestMetadata): Promise<void> {
    await this.rateLimits.consume(
      'verify-email-ip',
      request.ipPrefix ?? 'unknown',
      20,
      3_600,
    );
    const tokenHash = this.crypto.tokenHash(rawToken);
    const token = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true } } },
    });
    if (!token || token.consumedAt || token.expiresAt <= new Date()) {
      throw new BadRequestException(GENERIC_TOKEN_ERROR);
    }

    const now = new Date();
    await this.prisma.$transaction(
      async (transaction) => {
        const consumed = await transaction.emailVerificationToken.updateMany({
          where: { id: token.id, consumedAt: null, expiresAt: { gt: now } },
          data: { consumedAt: now, attemptCount: { increment: 1 } },
        });
        if (consumed.count !== 1)
          throw new ConflictException(GENERIC_TOKEN_ERROR);
        await transaction.user.update({
          where: { id: token.user.id },
          data: {
            status: UserStatus.ACTIVE,
            emailVerifiedAt: now,
            failedLoginCount: 0,
            lockedUntil: null,
          },
        });
        await transaction.emailVerificationToken.updateMany({
          where: { userId: token.user.id, consumedAt: null },
          data: { consumedAt: now },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    await this.audit.recordSecurity({
      userId: token.user.id,
      action: 'EMAIL_VERIFIED',
      outcome: 'SUCCESS',
      request,
    });
  }

  private progressiveLock(failedCount: number): Date | null {
    if (failedCount < 5) return null;
    const seconds = Math.min(900, 60 * 2 ** Math.min(failedCount - 5, 4));
    return new Date(Date.now() + seconds * 1_000);
  }

  private async failureDelay(failedCount: number): Promise<void> {
    const milliseconds = Math.min(2_000, 125 * 2 ** Math.min(failedCount, 4));
    await new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async login(input: LoginDto, request: RequestMetadata): Promise<LoginResult> {
    const canonicalEmail = this.crypto.normalizeEmail(input.email);
    await Promise.all([
      this.rateLimits.consume(
        'login-ip',
        request.ipPrefix ?? 'unknown',
        20,
        60,
      ),
      this.rateLimits.consume('login-account', canonicalEmail, 8, 900),
    ]);

    const user = await this.prisma.user.findUnique({
      where: { emailCanonical: canonicalEmail },
    });
    if (!user) {
      await this.crypto.verifyDummyPassword(input.password);
      await this.failureDelay(1);
      await this.audit.recordSecurity({
        action: 'LOGIN_FAILED',
        outcome: 'FAILURE',
        request,
        metadata: { accountHash: this.audit.hashIdentifier(canonicalEmail) },
      });
      throw new UnauthorizedException(GENERIC_CREDENTIAL_ERROR);
    }

    const now = new Date();
    const passwordValid =
      (!user.lockedUntil || user.lockedUntil <= now) &&
      (await this.crypto.verifyPassword(user.passwordHash, input.password));
    if (!passwordValid) {
      const failedLoginCount = user.failedLoginCount + 1;
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount,
          lockedUntil: this.progressiveLock(failedLoginCount),
        },
      });
      await this.failureDelay(failedLoginCount);
      await this.audit.recordSecurity({
        userId: user.id,
        action: 'LOGIN_FAILED',
        outcome: 'FAILURE',
        request,
      });
      throw new UnauthorizedException(GENERIC_CREDENTIAL_ERROR);
    }

    if (user.status === UserStatus.PENDING_VERIFICATION) {
      throw new ForbiddenException({
        error: 'EMAIL_VERIFICATION_REQUIRED',
        message: 'Confirme seu e-mail antes de entrar.',
      });
    }
    if (user.status !== UserStatus.ACTIVE || user.deletedAt) {
      throw new UnauthorizedException(GENERIC_CREDENTIAL_ERROR);
    }

    const clinics = await this.activeMemberships(user.id);
    const activeClinicId = clinics.length === 1 ? clinics[0].id : null;
    const refreshToken = this.crypto.randomToken();
    const familyId = randomUUID();
    const expirations = this.expiry(now);

    await this.prisma.$transaction(
      async (transaction) => {
        await transaction.user.update({
          where: { id: user.id },
          data: {
            failedLoginCount: 0,
            lockedUntil: null,
            lastLoginAt: now,
          },
        });
        await transaction.refreshSession.create({
          data: {
            userId: user.id,
            activeClinicId,
            familyId,
            tokenHash: this.crypto.tokenHash(refreshToken),
            ...expirations,
            ipPrefix: request.ipPrefix,
            userAgentSummary: request.userAgentSummary,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    const accessToken = await this.accessTokens.sign({
      userId: user.id,
      sid: familyId,
      sv: user.sessionVersion,
      clinicId: activeClinicId,
    });
    await this.rateLimits.clear('login-account', canonicalEmail);
    await this.audit.recordSecurity({
      userId: user.id,
      action: 'LOGIN_SUCCEEDED',
      outcome: 'SUCCESS',
      request,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email },
      clinics,
      activeClinicId,
    };
  }

  private async revokeFamily(familyId: string, reason: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: {
        familyId,
        status: { in: [SessionStatus.ACTIVE, SessionStatus.ROTATED] },
      },
      data: {
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });
  }

  async refresh(
    rawToken: string | null,
    request: RequestMetadata,
  ): Promise<RefreshResult> {
    if (!rawToken) throw new UnauthorizedException(GENERIC_CREDENTIAL_ERROR);
    const tokenHash = this.crypto.tokenHash(rawToken);
    await this.rateLimits.consume('refresh-token', tokenHash, 12, 60);
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!session) throw new UnauthorizedException(GENERIC_CREDENTIAL_ERROR);

    const now = new Date();
    if (session.status !== SessionStatus.ACTIVE) {
      await this.revokeFamily(session.familyId, 'REFRESH_REUSE_DETECTED');
      await this.audit.recordSecurity({
        userId: session.userId,
        action: 'REFRESH_REUSE_DETECTED',
        outcome: 'DENIED',
        request,
      });
      throw new UnauthorizedException(GENERIC_CREDENTIAL_ERROR);
    }
    if (session.idleExpiresAt <= now || session.absoluteExpiresAt <= now) {
      await this.prisma.refreshSession.update({
        where: { id: session.id },
        data: { status: SessionStatus.EXPIRED },
      });
      throw new UnauthorizedException(GENERIC_CREDENTIAL_ERROR);
    }
    if (session.user.status !== UserStatus.ACTIVE || session.user.deletedAt) {
      await this.revokeFamily(session.familyId, 'USER_INACTIVE');
      throw new UnauthorizedException(GENERIC_CREDENTIAL_ERROR);
    }

    let activeClinicId = session.activeClinicId;
    if (
      activeClinicId &&
      !(await this.hasActiveMembership(session.userId, activeClinicId))
    ) {
      activeClinicId = null;
    }

    const replacementToken = this.crypto.randomToken();
    const replacementId = randomUUID();
    const idleExpiresAt = new Date(
      Math.min(
        now.getTime() + this.refreshIdleTtlMs,
        session.absoluteExpiresAt.getTime(),
      ),
    );

    try {
      // The conditional update is the compare-and-swap boundary: PostgreSQL
      // rechecks status after the row lock, so exactly one rotation can win.
      await this.prisma.$transaction(async (transaction) => {
        const claimed = await transaction.refreshSession.updateMany({
          where: { id: session.id, status: SessionStatus.ACTIVE },
          data: {
            status: SessionStatus.ROTATED,
            lastUsedAt: now,
            replacedBySessionId: replacementId,
          },
        });
        if (claimed.count !== 1) throw new RefreshReuseDetectedError();
        await transaction.refreshSession.create({
          data: {
            id: replacementId,
            userId: session.userId,
            activeClinicId,
            familyId: session.familyId,
            parentSessionId: session.id,
            tokenHash: this.crypto.tokenHash(replacementToken),
            idleExpiresAt,
            absoluteExpiresAt: session.absoluteExpiresAt,
            ipPrefix: request.ipPrefix,
            userAgentSummary: request.userAgentSummary,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof RefreshReuseDetectedError ||
        isTransactionWriteConflict(error)
      ) {
        await this.revokeFamily(session.familyId, 'CONCURRENT_REFRESH_REUSE');
        await this.audit.recordSecurity({
          userId: session.userId,
          action: 'REFRESH_REUSE_DETECTED',
          outcome: 'DENIED',
          request,
          metadata: { concurrent: true },
        });
        throw new UnauthorizedException(GENERIC_CREDENTIAL_ERROR);
      }
      throw error;
    }

    return {
      refreshToken: replacementToken,
      activeClinicId,
      accessToken: await this.accessTokens.sign({
        userId: session.userId,
        sid: session.familyId,
        sv: session.user.sessionVersion,
        clinicId: activeClinicId,
      }),
    };
  }

  async logout(
    rawToken: string | null,
    request: RequestMetadata,
  ): Promise<void> {
    if (!rawToken) return;
    const session = await this.prisma.refreshSession.findUnique({
      where: { tokenHash: this.crypto.tokenHash(rawToken) },
      select: { familyId: true, userId: true },
    });
    if (!session) return;
    await this.revokeFamily(session.familyId, 'USER_LOGOUT');
    await this.audit.recordSecurity({
      userId: session.userId,
      action: 'LOGOUT',
      outcome: 'SUCCESS',
      request,
    });
  }

  async logoutAll(
    principal: AuthenticatedPrincipal,
    request: RequestMetadata,
  ): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.refreshSession.updateMany({
        where: {
          userId: principal.userId,
          status: { in: [SessionStatus.ACTIVE, SessionStatus.ROTATED] },
        },
        data: {
          status: SessionStatus.REVOKED,
          revokedAt: new Date(),
          revokeReason: 'USER_LOGOUT_ALL',
        },
      });
      await transaction.user.update({
        where: { id: principal.userId },
        data: { sessionVersion: { increment: 1 } },
      });
    });
    await this.audit.recordSecurity({
      userId: principal.userId,
      action: 'LOGOUT_ALL',
      outcome: 'SUCCESS',
      request,
    });
  }

  async forgotPassword(
    input: ForgotPasswordDto,
    request: RequestMetadata,
  ): Promise<void> {
    const canonicalEmail = this.crypto.normalizeEmail(input.email);
    await Promise.all([
      this.rateLimits.consume(
        'forgot-ip',
        request.ipPrefix ?? 'unknown',
        10,
        3_600,
      ),
      this.rateLimits.consume('forgot-account', canonicalEmail, 3, 3_600),
    ]);
    const user = await this.prisma.user.findUnique({
      where: { emailCanonical: canonicalEmail },
      select: { id: true, email: true, status: true, deletedAt: true },
    });
    if (!user || user.status !== UserStatus.ACTIVE || user.deletedAt) return;

    const rawToken = this.crypto.randomToken();
    const now = new Date();
    await this.prisma.$transaction(async (transaction) => {
      await transaction.passwordResetToken.updateMany({
        where: { userId: user.id, consumedAt: null },
        data: { consumedAt: now },
      });
      await transaction.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: this.crypto.tokenHash(rawToken),
          expiresAt: new Date(now.getTime() + 30 * 60 * 1_000),
        },
      });
    });
    await this.email.sendPasswordReset(user.email, rawToken);
    await this.audit.recordSecurity({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      outcome: 'SUCCESS',
      request,
    });
  }

  async resetPassword(
    input: ResetPasswordDto,
    request: RequestMetadata,
  ): Promise<void> {
    const token = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: this.crypto.tokenHash(input.token) },
      include: { user: { select: { id: true, emailCanonical: true } } },
    });
    if (!token || token.consumedAt || token.expiresAt <= new Date()) {
      throw new BadRequestException(GENERIC_TOKEN_ERROR);
    }
    this.assertPasswordNotPredictable(
      input.password,
      token.user.emailCanonical,
    );
    const passwordHash = await this.crypto.hashPassword(input.password);
    const now = new Date();

    await this.prisma.$transaction(
      async (transaction) => {
        const consumed = await transaction.passwordResetToken.updateMany({
          where: { id: token.id, consumedAt: null, expiresAt: { gt: now } },
          data: { consumedAt: now, attemptCount: { increment: 1 } },
        });
        if (consumed.count !== 1)
          throw new ConflictException(GENERIC_TOKEN_ERROR);
        await transaction.user.update({
          where: { id: token.user.id },
          data: {
            passwordHash,
            passwordHashVersion: { increment: 1 },
            sessionVersion: { increment: 1 },
            failedLoginCount: 0,
            lockedUntil: null,
          },
        });
        await transaction.refreshSession.updateMany({
          where: {
            userId: token.user.id,
            status: { in: [SessionStatus.ACTIVE, SessionStatus.ROTATED] },
          },
          data: {
            status: SessionStatus.REVOKED,
            revokedAt: now,
            revokeReason: 'PASSWORD_RESET',
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    await this.audit.recordSecurity({
      userId: token.user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      outcome: 'SUCCESS',
      request,
    });
  }

  async selectActiveClinic(
    principal: AuthenticatedPrincipal,
    clinicId: string,
    request: RequestMetadata,
  ): Promise<{ accessToken: string; activeClinicId: string }> {
    if (!(await this.hasActiveMembership(principal.userId, clinicId))) {
      await this.audit.recordSecurity({
        userId: principal.userId,
        action: 'ACTIVE_CLINIC_SELECTION_DENIED',
        outcome: 'DENIED',
        request,
      });
      throw new ForbiddenException({
        error: 'CLINIC_ACCESS_DENIED',
        message: 'Clínica não disponível para este usuário.',
      });
    }

    const updated = await this.prisma.refreshSession.updateMany({
      where: {
        userId: principal.userId,
        familyId: principal.sessionFamilyId,
        status: SessionStatus.ACTIVE,
      },
      data: { activeClinicId: clinicId },
    });
    if (updated.count !== 1)
      throw new UnauthorizedException(GENERIC_CREDENTIAL_ERROR);

    await this.audit.recordTenant({
      clinicId,
      userId: principal.userId,
      action: 'ACTIVE_CLINIC_SELECTED',
      entityType: 'Clinic',
      entityId: clinicId,
      outcome: 'SUCCESS',
      request,
    });
    return {
      activeClinicId: clinicId,
      accessToken: await this.accessTokens.sign({
        userId: principal.userId,
        sid: principal.sessionFamilyId,
        sv: principal.sessionVersion,
        clinicId,
      }),
    };
  }

  async listSessions(
    principal: AuthenticatedPrincipal,
  ): Promise<readonly object[]> {
    const sessions = await this.prisma.refreshSession.findMany({
      where: { userId: principal.userId, status: SessionStatus.ACTIVE },
      orderBy: { issuedAt: 'desc' },
      select: {
        familyId: true,
        activeClinicId: true,
        issuedAt: true,
        lastUsedAt: true,
        idleExpiresAt: true,
        absoluteExpiresAt: true,
        ipPrefix: true,
        userAgentSummary: true,
      },
    });
    return sessions.map((session) => ({
      ...session,
      current: session.familyId === principal.sessionFamilyId,
    }));
  }
}
