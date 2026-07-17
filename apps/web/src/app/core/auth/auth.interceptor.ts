import {
  HttpErrorResponse,
  type HttpEvent,
  type HttpHandlerFn,
  type HttpInterceptorFn,
  type HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError, type Observable } from 'rxjs';
import { AuthStore } from './auth.store';

const AUTH_ENDPOINT_PATTERN = /\/api\/v1\/auth\/(?:login|refresh|signup|password|email)/;

function authenticatedRequest(
  request: HttpRequest<unknown>,
  token: string | null,
): HttpRequest<unknown> {
  return request.clone({
    withCredentials: true,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthStore);
  const outgoing = authenticatedRequest(request, auth.accessToken());
  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        AUTH_ENDPOINT_PATTERN.test(request.url)
      ) {
        return throwError(() => error);
      }
      return from(auth.refreshAccessToken()).pipe(
        switchMap((token) => next(authenticatedRequest(request, token))),
      );
    }),
  );
};
