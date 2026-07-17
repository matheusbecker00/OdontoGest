import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { firebaseOptions } from '../../environments/firebase.options';

const FIREBASE_APP_NAME = 'odontogest-web';

export function getOdontoGestFirebaseApp(): FirebaseApp {
  return (
    getApps().find((candidate) => candidate.name === FIREBASE_APP_NAME) ??
    initializeApp(firebaseOptions, FIREBASE_APP_NAME)
  );
}
