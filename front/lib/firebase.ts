import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// NOTE SÉCURITÉ : ces clés sont PUBLIQUES par nature (elles sont embarquées
// dans le bundle client et visibles via les DevTools). Elles ne sont PAS des
// secrets à protéger — la sécurité côté Firebase repose sur les règles
// Firestore/Database et les Security Rules, pas sur ces identifiants.
// Ne jamais y stocker de clé serveur (Admin SDK, service account), service account private key, etc.
const firebaseConfig = {
  apiKey: 'AIzaSyDyjon3BYudRmKRJgzDOVsq2gVoifiTVY0',
  authDomain: 'quarantes-holding.firebaseapp.com',
  projectId: 'quarantes-holding',
  storageBucket: 'quarantes-holding.firebasestorage.app',
  messagingSenderId: '613811476880',
  appId: '1:613811476880:web:6f020dc849bda708b83b15',
  measurementId: 'G-DB9GB0573P',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();

let analyticsInstance: Analytics | null = null;
export const getAnalyticsInstance = (): Analytics | null => {
  if (typeof window !== 'undefined' && !analyticsInstance) {
    analyticsInstance = getAnalytics(app);
  }
  return analyticsInstance;
};
