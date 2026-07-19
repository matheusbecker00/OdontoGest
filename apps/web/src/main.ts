import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { renderFatalError } from './app/core/runtime/fatal-error';

bootstrapApplication(App, appConfig).catch((error: unknown) => {
  console.error(error);
  renderFatalError();
});
