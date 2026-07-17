import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedPrincipal } from '../http/authenticated-principal';

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedPrincipal => {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.user) {
      throw new Error(
        'Principal autenticado ausente no contexto da requisição.',
      );
    }
    return request.user;
  },
);
