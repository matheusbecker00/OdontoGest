import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { renderFatalError } from './app/core/runtime/fatal-error';

globalThis.addEventListener?.('error', (event) => {
  renderFatalError(event.error ?? event.message);
});

globalThis.addEventListener?.('unhandledrejection', (event) => {
  renderFatalError(event.reason);
});

bootstrapApplication(App, appConfig).catch((error: unknown) => {
  console.error(error);
  renderFatalError(error);
});
