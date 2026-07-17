import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { RequestMetadata } from '../../common/http/request-metadata';
import { PrismaService } from '../../platform/database/prisma.service';

type SafeMetadataValue = string | number | boolean | null;
type SafeMetadata = Readonly<Record<string, SafeMetadataValue>>;

export interface SecurityAuditInput {
  userId?: string | null;
  action: string;
  outcome: 'SUCCESS' | 'DENIED' | 'FAILURE';
  request: RequestMetadata;
  metadata?: SafeMetadata;
}

export interface TenantAuditInput extends SecurityAuditInput {
  clinicId: string;
  entityType: string;
  entityId?: string | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  hashIdentifier(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  async recordSecurity(input: SecurityAuditInput): Promise<void> {
    await this.prisma.securityEvent.create({
      data: {
        userId: input.userId,
        action: input.action,
        outcome: input.outcome,
        requestId: input.request.requestId,
        ipPrefix: input.request.ipPrefix,
        userAgentSummary: input.request.userAgentSummary,
        metadataRedacted: input.metadata,
      },
    });
  }

  async recordTenant(input: TenantAuditInput): Promise<void> {
    await this.prisma.withSecurityContext(
      { userId: input.userId ?? '', clinicId: input.clinicId },
      async (transaction) => {
        await transaction.auditLog.create({
          data: {
            clinicId: input.clinicId,
            actorUserId: input.userId,
            action: input.action,
            entityType: input.entityType,
            entityId: input.entityId,
            outcome: input.outcome,
            requestId: input.request.requestId,
            ipPrefix: input.request.ipPrefix,
            userAgentSummary: input.request.userAgentSummary,
            metadataRedacted: input.metadata,
          },
        });
      },
    );
  }

  async listTenantEvents(userId: string, clinicId: string) {
    return this.prisma.withSecurityContext(
      { userId, clinicId },
      (transaction) =>
        transaction.auditLog.findMany({
          where: { clinicId },
          orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }],
          take: 50,
          select: {
            id: true,
            actorUserId: true,
            action: true,
            entityType: true,
            entityId: true,
            outcome: true,
            requestId: true,
            occurredAt: true,
            metadataRedacted: true,
          },
        }),
    );
  }
}
