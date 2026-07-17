import type { AuthenticatedPrincipal } from '../common/http/authenticated-principal';

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: AuthenticatedPrincipal;
    }
  }
}

export {};
