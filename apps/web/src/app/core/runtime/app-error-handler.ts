import { ErrorHandler, Injectable } from '@angular/core';
import { renderFatalError } from './fatal-error';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    console.error(error);

    const appRoot = typeof document === 'undefined' ? null : document.querySelector('app-root');
    if (!appRoot?.childElementCount) renderFatalError();
  }
}
