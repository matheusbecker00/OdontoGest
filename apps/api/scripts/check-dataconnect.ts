import { getApps, initializeApp } from 'firebase-admin/app';
import { healthCheck } from '@odontogest/dataconnect-admin';

async function main(): Promise<void> {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-odontogest',
    });
  }

  await healthCheck();
  process.stdout.write('SQL Connect respondeu pelo conector administrativo.\n');
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Erro desconhecido';
  process.stderr.write(`Falha no SQL Connect: ${message}\n`);
  process.exitCode = 1;
});
