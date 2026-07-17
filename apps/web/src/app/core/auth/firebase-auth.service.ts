import { Injectable } from '@angular/core';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
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

  async signOut(): Promise<void> {
    await this.ready;
    await signOut(this.auth);
  }
}
