import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type AppOptions,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { AppEnvironment } from '../../config/environment';

const FIREBASE_APP_NAME = 'odontogest-api-auth';
const INVALID_FIREBASE_TOKEN = {
  error: 'INVALID_FIREBASE_TOKEN',
  message: 'A identidade informada é inválida ou expirou.',
} as const;

export interface FirebaseIdentity {
  uid: string;
  email: string;
  emailVerified: boolean;
}

@Injectable()
export class FirebaseIdentityService {
  private readonly app: App;
  private readonly checkRevoked: boolean;

  constructor(config: ConfigService<AppEnvironment, true>) {
    const projectId = config.get('FIREBASE_PROJECT_ID', { infer: true });
    const clientEmail = config.get('FIREBASE_CLIENT_EMAIL', { infer: true });
    const privateKey = config.get('FIREBASE_PRIVATE_KEY', { infer: true });
    this.checkRevoked = config.get('FIREBASE_AUTH_CHECK_REVOKED', {
      infer: true,
    });

    const options: AppOptions = { projectId };
    if (clientEmail && privateKey) {
      options.credential = cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      });
    }

    this.app =
      getApps().find((candidate) => candidate.name === FIREBASE_APP_NAME) ??
      initializeApp(options, FIREBASE_APP_NAME);
  }

  private async decodeIdToken(idToken: string): Promise<FirebaseIdentity> {
    let decoded: Awaited<
      ReturnType<ReturnType<typeof getAuth>['verifyIdToken']>
    >;
    try {
      decoded = await getAuth(this.app).verifyIdToken(
        idToken,
        this.checkRevoked,
      );
    } catch {
      throw new UnauthorizedException(INVALID_FIREBASE_TOKEN);
    }

    if (!decoded.email) {
      throw new UnauthorizedException(INVALID_FIREBASE_TOKEN);
    }

    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified === true,
    };
  }

  async verifyIdToken(idToken: string): Promise<FirebaseIdentity> {
    const identity = await this.decodeIdToken(idToken);
    if (!identity.emailVerified) {
      throw new ForbiddenException({
        error: 'EMAIL_VERIFICATION_REQUIRED',
        message: 'Confirme seu e-mail antes de entrar.',
      });
    }

    return identity;
  }

  verifyIdTokenForOnboarding(idToken: string): Promise<FirebaseIdentity> {
    return this.decodeIdToken(idToken);
  }
}
