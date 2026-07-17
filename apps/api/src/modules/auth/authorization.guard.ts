import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PERMISSIONS_KEY } from '../../common/decorators/permissions.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<readonly string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest<Request>();
    if (
      request.user?.activeClinicId &&
      required.every((permission) => request.user?.permissions.has(permission))
    ) {
      return true;
    }

    throw new ForbiddenException({
      error: 'PERMISSION_DENIED',
      message: 'Você não possui permissão para realizar esta ação.',
    });
  }
}
