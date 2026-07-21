import { Injectable } from '@angular/core';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
} from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { firebaseOptions } from '../../../environments/firebase.options';
import { getOdontoGestFirebaseApp } from '../firebase-app';

const ACCESS_CODE_EMAIL_DOMAIN = 'acesso.odontogest.local';

export interface FirebaseAuthProfile {
  readonly id: string;
  readonly name: string | null;
  readonly email: string | null;
}

export interface SecondaryAccount {
  readonly userId: string;
  readonly email: string;
  readonly accessCode: string | null;
}

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private readonly auth: Auth;
  private readonly ready: Promise<void>;

  constructor() {
    this.auth = getAuth(getOdontoGestFirebaseApp());

    if (environment.useFirebaseAuthEmulator) {
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', {
        disableWarnings: true,
      });
    }

    this.ready = setPersistence(this.auth, browserLocalPersistence);
  }

  async signIn(identifier: string, password: string): Promise<void> {
    await this.ready;
    await signInWithEmailAndPassword(this.auth, this.toAuthEmail(identifier), password);
  }

  async createAccount(email: string, password: string, displayName: string): Promise<void> {
    await this.ready;
    let credential;
    try {
      credential = await createUserWithEmailAndPassword(this.auth, email.trim(), password);
    } catch (error) {
      if (
        typeof error !== 'object' ||
        error === null ||
        !('code' in error) ||
        error.code !== 'auth/email-already-in-use'
      ) {
        throw error;
      }
      credential = await signInWithEmailAndPassword(this.auth, email.trim(), password);
    }
    await updateProfile(credential.user, { displayName: displayName.trim() });
  }

  async createSecondaryAccount(input: {
    readonly identifier: string;
    readonly password: string;
    readonly displayName: string;
  }): Promise<SecondaryAccount> {
    await this.ready;
    const identity = this.toAuthIdentity(input.identifier);
    if (input.password.length < 6) {
      throw new Error('A senha precisa ter pelo menos 6 digitos.');
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseOptions.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: identity.email,
          password: input.password,
          displayName: input.displayName.trim(),
          returnSecureToken: false,
        }),
      },
    );
    const payload = (await response.json().catch(() => ({}))) as {
      localId?: string;
      email?: string;
      error?: { message?: string };
    };
    if (!response.ok || !payload.localId) {
      throw new Error(this.identityToolkitMessage(payload.error?.message));
    }
    return {
      userId: payload.localId,
      email: payload.email ?? identity.email,
      accessCode: identity.accessCode,
    };
  }

  async waitUntilReady(): Promise<boolean> {
    await this.ready;
    await this.auth.authStateReady();
    return this.auth.currentUser !== null;
  }

  async getCurrentUserProfile(): Promise<FirebaseAuthProfile | null> {
    await this.ready;
    await this.auth.authStateReady();
    const user = this.auth.currentUser;
    if (!user) return null;
    return {
      id: user.uid,
      name: user.displayName,
      email: user.email,
    };
  }

  async getIdToken(): Promise<string> {
    await this.ready;
    await this.auth.authStateReady();
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario autenticado nao encontrado.');
    return user.getIdToken();
  }

  async sendVerificationAndSignOut(): Promise<void> {
    await this.ready;
    const user = this.auth.currentUser;
    try {
      if (user && !user.emailVerified) {
        await sendEmailVerification(user, {
          ...this.emailActionSettings(),
        });
      }
    } finally {
      await signOut(this.auth);
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    await this.ready;
    await sendPasswordResetEmail(this.auth, this.toAuthEmail(email), {
      url: `${globalThis.location.origin}/login?passwordReset=success`,
    });
  }

  async signOut(): Promise<void> {
    await this.ready;
    await signOut(this.auth);
  }

  private emailActionSettings() {
    return { url: `${globalThis.location.origin}/login?emailVerified=success` };
  }

  private toAuthEmail(identifier: string): string {
    return this.toAuthIdentity(identifier).email;
  }

  private toAuthIdentity(identifier: string): {
    readonly email: string;
    readonly accessCode: string | null;
  } {
    const value = identifier.trim().toLowerCase();
    if (/^\d+$/.test(value)) {
      return {
        email: `${value}@${ACCESS_CODE_EMAIL_DOMAIN}`,
        accessCode: value,
      };
    }
    return { email: value, accessCode: null };
  }

  private identityToolkitMessage(code: string | undefined): string {
    if (code === 'EMAIL_EXISTS') return 'Este e-mail ou codigo ja esta em uso.';
    if (code === 'WEAK_PASSWORD : Password should be at least 6 characters') {
      return 'A senha precisa ter pelo menos 6 digitos.';
    }
    if (code === 'INVALID_EMAIL') return 'Informe um e-mail valido ou apenas numeros no codigo.';
    return 'Nao foi possivel criar o usuario no Firebase Authentication.';
  }
}
