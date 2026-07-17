import type { FirebaseOptions } from 'firebase/app';

// A configuração Web identifica o projeto Firebase e é pública por design.
// Credenciais do Admin SDK nunca devem ser adicionadas ao frontend.
export const firebaseOptions: FirebaseOptions = {
  apiKey: 'AIzaSyAHD21yPLO_eDJGGT6UNgzUf0eOwYYBm1w',
  authDomain: 'odongest.firebaseapp.com',
  projectId: 'odongest',
  storageBucket: 'odongest.firebasestorage.app',
  messagingSenderId: '1055705106726',
  appId: '1:1055705106726:web:4f774d855d7eee955099e7',
  measurementId: 'G-1RPNH3CHS1',
};
