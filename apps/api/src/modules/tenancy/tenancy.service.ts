import { Injectable } from '@nestjs/common';
import { MembershipStatus } from '../../generated/prisma/enums';
import type { AuthenticatedPrincipal } from '../../common/http/authenticated-principal';
import { PrismaService } from '../../platform/database/prisma.service';

@Injectable()
export class TenancyService {
  constructor(private readonly prisma: PrismaService) {}

  async listClinics(userId: string) {
    return this.prisma.withSecurityContext({ userId }, async (transaction) => {
      const memberships = await transaction.clinicMembership.findMany({
        where: {
          userId,
          status: MembershipStatus.ACTIVE,
          deletedAt: null,
          clinic: { deletedAt: null },
        },
        orderBy: { clinic: { tradeName: 'asc' } },
        select: {
          authorizationVersion: true,
          clinic: {
            select: {
              id: true,
              tradeName: true,
              status: true,
              timezone: true,
              locale: true,
              currency: true,
            },
          },
          role: { select: { code: true, name: true } },
        },
      });
      return memberships.map((membership) => ({
        ...membership.clinic,
        role: membership.role,
        authorizationVersion: membership.authorizationVersion,
      }));
    });
  }

  context(principal: AuthenticatedPrincipal) {
    return {
      activeClinicId: principal.activeClinicId,
      roleCode: principal.roleCode,
      authorizationVersion: principal.authorizationVersion,
      permissions: [...principal.permissions].sort(),
    };
  }
}
