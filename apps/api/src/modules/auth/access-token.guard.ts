import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import {
  MembershipStatus,
  SessionStatus,
  UserStatus,
} from '../../generated/prisma/enums';
import { PrismaService } from '../../platform/database/prisma.service';
import { AccessTokenService } from './access-token.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: AccessTokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        error: 'AUTHENTICATION_REQUIRED',
        message: 'Autenticação necessária.',
      });
    }

    const payload = await this.tokens.verify(authorization.slice(7));
    const now = new Date();
    const [user, activeSession] = await Promise.all([
      this.prisma.user.findFirst({
        where: {
          id: payload.sub,
          status: UserStatus.ACTIVE,
          deletedAt: null,
        },
        select: { sessionVersion: true },
      }),
      this.prisma.refreshSession.findFirst({
        where: {
          userId: payload.sub,
          familyId: payload.sid,
          status: SessionStatus.ACTIVE,
          idleExpiresAt: { gt: now },
          absoluteExpiresAt: { gt: now },
        },
        select: { id: true },
      }),
    ]);

    if (!user || !activeSession || user.sessionVersion !== payload.sv) {
      throw new UnauthorizedException({
        error: 'SESSION_REVOKED',
        message: 'Sessão inválida ou revogada.',
      });
    }

    let roleCode: string | null = null;
    let authorizationVersion: number | null = null;
    let permissions: ReadonlySet<string> = new Set();

    if (payload.clinicId) {
      const clinicId = payload.clinicId;
      const membership = await this.prisma.withSecurityContext(
        { userId: payload.sub },
        (transaction) =>
          transaction.clinicMembership.findFirst({
            where: {
              clinicId,
              userId: payload.sub,
              status: MembershipStatus.ACTIVE,
              deletedAt: null,
            },
            select: {
              authorizationVersion: true,
              role: {
                select: {
                  code: true,
                  permissions: {
                    select: { permission: { select: { code: true } } },
                  },
                },
              },
            },
          }),
      );

      if (!membership) {
        throw new UnauthorizedException({
          error: 'ACTIVE_CLINIC_REVOKED',
          message: 'O acesso à clínica ativa não está mais disponível.',
        });
      }
      roleCode = membership.role.code;
      authorizationVersion = membership.authorizationVersion;
      permissions = new Set(
        membership.role.permissions.map((item) => item.permission.code),
      );
    }

    request.user = {
      userId: payload.sub,
      sessionFamilyId: payload.sid,
      sessionVersion: payload.sv,
      activeClinicId: payload.clinicId,
      roleCode,
      authorizationVersion,
      permissions,
    };
    return true;
  }
}
