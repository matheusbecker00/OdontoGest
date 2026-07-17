import { ConflictException } from '@nestjs/common';

jest.mock('../../platform/database/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import type { RequestMetadata } from '../../common/http/request-metadata';
import type { PrismaService } from '../../platform/database/prisma.service';
import type { RateLimitService } from '../../platform/rate-limit/rate-limit.service';
import type { CryptoService } from './crypto.service';
import type { FirebaseIdentityService } from './firebase-identity.service';
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
  const prisma = { $queryRaw: jest.fn() };
  const firebaseIdentity = { verifyIdTokenForOnboarding: jest.fn() };
  const rateLimits = { consume: jest.fn(), clear: jest.fn() };
  const crypto = {
    normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
    tokenHash: jest.fn(() => 'a'.repeat(64)),
  };
  const request: RequestMetadata = {
    requestId: 'request-onboarding-1',
    ipPrefix: '192.0.2.0/24',
    userAgentSummary: 'test-agent',
  };

  const service = new OnboardingService(
    prisma as unknown as PrismaService,
    firebaseIdentity as unknown as FirebaseIdentityService,
    rateLimits as unknown as RateLimitService,
    crypto as unknown as CryptoService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    firebaseIdentity.verifyIdTokenForOnboarding.mockResolvedValue({
      uid: 'firebase-owner-1',
      email: 'owner@example.test',
      emailVerified: false,
    });
    prisma.$queryRaw.mockResolvedValue([
      {
        userId: '11111111-1111-4111-8111-111111111111',
        clinicId: '22222222-2222-4222-8222-222222222222',
        created: true,
      },
    ]);
  });

  it('provisiona a clínica usando somente a identidade Firebase', async () => {
    await expect(
      service.create(
        {
          idToken: 'token'.padEnd(100, '-'),
          responsibleName: 'Marina Souza',
          clinicName: 'Clínica Sorriso',
          acceptTerms: true,
        },
        request,
      ),
    ).resolves.toEqual({
      clinicId: '22222222-2222-4222-8222-222222222222',
      created: true,
      verificationRequired: true,
    });
    expect(firebaseIdentity.verifyIdTokenForOnboarding).toHaveBeenCalled();
    expect(rateLimits.clear).toHaveBeenCalledWith(
      'onboarding-account',
      'firebase-owner-1',
    );
    const queryCalls = prisma.$queryRaw.mock.calls as unknown[][];
    const queryTemplate = queryCalls.at(0)?.at(0);
    expect(Array.isArray(queryTemplate)).toBe(true);
    if (!Array.isArray(queryTemplate)) throw new Error('Query ausente.');
    expect(queryTemplate.join('')).toContain('::char(64)');
  });

  it('transforma conflito de identidade do banco em resposta segura', async () => {
    prisma.$queryRaw.mockRejectedValue({
      code: 'P2010',
      meta: { code: '23505' },
    });

    await expect(
      service.create(
        {
          idToken: 'token'.padEnd(100, '-'),
          responsibleName: 'Marina Souza',
          clinicName: 'Clínica Sorriso',
          acceptTerms: true,
        },
        request,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
