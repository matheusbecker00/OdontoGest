import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,80}$/;

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const candidate = request.get('x-request-id');
    const existing =
      (typeof request.id === 'string' || typeof request.id === 'number') &&
      REQUEST_ID_PATTERN.test(request.id.toString())
        ? request.id.toString()
        : null;
    request.id =
      candidate && REQUEST_ID_PATTERN.test(candidate)
        ? candidate
        : (existing ?? randomUUID());
    response.setHeader('x-request-id', request.id);
    next();
  }
}
