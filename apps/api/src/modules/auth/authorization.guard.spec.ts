import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AuthenticatedPrincipal } from '../../common/http/authenticated-principal';
import { AuthorizationGuard } from './authorization.guard';

function contextWithPrincipal(
  principal: AuthenticatedPrincipal,
): ExecutionContext {
  const request = { user: principal } as Request;
  return {
    getClass: () => class TestController {},
    getHandler: () => () => undefined,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('AuthorizationGuard', () => {
  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;
  const guard = new AuthorizationGuard(reflector);
  const basePrincipal: AuthenticatedPrincipal = {
    userId: '00000000-0000-4000-8000-000000000001',
    sessionFamilyId: '00000000-0000-4000-8000-000000000002',
    sessionVersion: 1,
    activeClinicId: '00000000-0000-4000-8000-000000000003',
    roleCode: 'RECEPTIONIST',
    authorizationVersion: 1,
    permissions: new Set(['appointment.create']),
  };

  beforeEach(() => jest.clearAllMocks());

  it('autoriza somente quando todas as permissões estão presentes', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['appointment.create']);
    expect(guard.canActivate(contextWithPrincipal(basePrincipal))).toBe(true);
  });

  it('nega ação financeira não concedida ao papel', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['payment.reverse']);
    expect(() =>
      guard.canActivate(contextWithPrincipal(basePrincipal)),
    ).toThrow(ForbiddenException);
  });
});
