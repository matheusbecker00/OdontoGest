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
import { getOdontoGestFirebaseApp } from '../firebase-app';

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

  async signIn(email: string, password: string): Promise<void> {
    await this.ready;
    await signInWithEmailAndPassword(this.auth, email.trim(), password);
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

  async waitUntilReady(): Promise<boolean> {
    await this.ready;
    await this.auth.authStateReady();
    return this.auth.currentUser !== null;
  }

  async sendVerificationAndSignOut(): Promise<void> {
    await this.ready;
    const user = this.auth.currentUser;
    try {
      if (user && !user.emailVerified) {
        await sendEmailVerification(user, {
          url: `${globalThis.location.origin}/login?emailVerified=success`,
        });
      }
    } finally {
      await signOut(this.auth);
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    await this.ready;
    await sendPasswordResetEmail(this.auth, email.trim().toLowerCase(), {
      url: `${globalThis.location.origin}/login?passwordReset=success`,
    });
  }

  async signOut(): Promise<void> {
    await this.ready;
    await signOut(this.auth);
  }
}
