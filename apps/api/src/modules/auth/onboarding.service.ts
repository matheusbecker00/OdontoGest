import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { RequestMetadata } from '../../common/http/request-metadata';
import { PrismaService } from '../../platform/database/prisma.service';
import { RateLimitService } from '../../platform/rate-limit/rate-limit.service';
import { CryptoService } from './crypto.service';
import type { FirebaseOnboardingDto } from './dto/auth.dto';
import { FirebaseIdentityService } from './firebase-identity.service';

const CURRENT_TERMS_VERSION = '2026-07-16';

interface OnboardingRow {
  userId: string;
  clinicId: string;
  created: boolean;
}

function hasDatabaseCode(error: unknown, expected: string, depth = 0): boolean {
  if (typeof error !== 'object' || error === null || depth > 4) return false;
  const record = error as Record<string, unknown>;
  return (
    record['code'] === expected ||
    hasDatabaseCode(record['meta'], expected, depth + 1) ||
    hasDatabaseCode(record['cause'], expected, depth + 1)
  );
}

@Injectable()
export class OnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseIdentity: FirebaseIdentityService,
    private readonly rateLimits: RateLimitService,
    private readonly crypto: CryptoService,
  ) {}

  async create(
    input: FirebaseOnboardingDto,
    request: RequestMetadata,
  ): Promise<{
    clinicId: string;
    created: boolean;
    verificationRequired: true;
  }> {
    await this.rateLimits.consume(
      'onboarding-ip',
      request.ipPrefix ?? 'unknown',
      5,
      3_600,
    );
    const identity = await this.firebaseIdentity.verifyIdTokenForOnboarding(
      input.idToken,
    );
    await this.rateLimits.consume('onboarding-account', identity.uid, 3, 3_600);

    const acceptedAt = new Date();
    const canonicalEmail = this.crypto.normalizeEmail(identity.email);
    const userId = randomUUID();
    const clinicId = randomUUID();
    const evidenceDigest = this.crypto.tokenHash(
      [
        CURRENT_TERMS_VERSION,
        identity.uid,
        clinicId,
        acceptedAt.toISOString(),
        request.requestId,
      ].join('|'),
    );

    let rows: OnboardingRow[];
    try {
      rows = await this.prisma.$queryRaw<OnboardingRow[]>`
        SELECT *
        FROM app_private.create_firebase_onboarding(
          ${userId}::uuid,
          ${identity.uid}::varchar,
          ${input.responsibleName.trim()}::varchar,
          ${identity.email.trim()}::varchar,
          ${canonicalEmail}::varchar,
          ${clinicId}::uuid,
          ${randomUUID()}::uuid,
          ${randomUUID()}::uuid,
          ${randomUUID()}::uuid,
          ${randomUUID()}::uuid,
          ${randomUUID()}::uuid,
          ${input.clinicName.trim()}::varchar,
          ${CURRENT_TERMS_VERSION}::varchar,
          ${evidenceDigest}::char,
          ${request.requestId}::varchar,
          ${request.ipPrefix}::varchar,
          ${request.userAgentSummary}::varchar,
          ${acceptedAt}::timestamptz
        )
      `;
    } catch (error) {
      if (!hasDatabaseCode(error, '23505')) throw error;
      throw new ConflictException({
        error: 'ONBOARDING_IDENTITY_CONFLICT',
        message: 'Não foi possível associar esta identidade ao cadastro.',
      });
    }

    const result = rows[0];
    if (!result) throw new Error('O banco não retornou o onboarding criado.');
    await this.rateLimits.clear('onboarding-account', identity.uid);
    return {
      clinicId: result.clinicId,
      created: result.created,
      verificationRequired: true,
    };
  }
}
