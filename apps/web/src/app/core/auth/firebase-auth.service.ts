import { Injectable } from '@angular/core';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
} from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { firebaseOptions } from '../../../environments/firebase.options';

const FIREBASE_APP_NAME = 'odontogest-web';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private readonly auth: Auth;
  private readonly ready: Promise<void>;

  constructor() {
    const app: FirebaseApp =
      getApps().find((candidate) => candidate.name === FIREBASE_APP_NAME) ??
      initializeApp(firebaseOptions, FIREBASE_APP_NAME);
    this.auth = getAuth(app);

    if (environment.useFirebaseAuthEmulator) {
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', {
        disableWarnings: true,
      });
    }

    this.ready = setPersistence(this.auth, inMemoryPersistence);
  }

  async signIn(email: string, password: string): Promise<string> {
    await this.ready;
    const credential = await signInWithEmailAndPassword(this.auth, email.trim(), password);
    return credential.user.getIdToken(true);
  }

  async createAccount(email: string, password: string, displayName: string): Promise<string> {
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
    return credential.user.getIdToken(true);
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

  async signOut(): Promise<void> {
    await this.ready;
    await signOut(this.auth);
  }
}
