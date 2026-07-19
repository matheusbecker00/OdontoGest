import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  type NavigationError,
  PreloadAllModules,
  provideRouter,
  withNavigationErrorHandler,
  withPreloading,
} from '@angular/router';

import { routes } from './app.routes';

const CHUNK_RECOVERY_KEY = 'og.chunk-recovery';

export function isChunkLoadError(value: unknown): boolean {
  const message = value instanceof Error ? value.message : String(value);
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    message,
  );
}

function recoverNavigation(error: NavigationError): void {
  if (!isChunkLoadError(error.error)) return;

  try {
    const previous = JSON.parse(sessionStorage.getItem(CHUNK_RECOVERY_KEY) ?? 'null') as {
      url?: string;
      at?: number;
    } | null;
    const repeatedRecently =
      previous?.url === error.url && Date.now() - (previous.at ?? 0) < 30_000;

    if (repeatedRecently) {
      sessionStorage.removeItem(CHUNK_RECOVERY_KEY);
      location.replace('/login?erro=carregamento');
      return;
    }

    sessionStorage.setItem(CHUNK_RECOVERY_KEY, JSON.stringify({ url: error.url, at: Date.now() }));
  } catch {
    // Storage may be unavailable in private browsing; a hard reload is still safe.
  }

  location.replace(error.url);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withNavigationErrorHandler(recoverNavigation),
    ),
    provideHttpClient(),
  ],
};
