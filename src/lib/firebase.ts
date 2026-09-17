import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// In browser environments with reverse proxy support, use same-origin authDomain
// This ensures that Safari (ITP), iOS, Chrome Mobile, and desktop browsers operate in a same-origin context,
// completely eliminating the "Unable to process request due to missing initial state" error.
const resolvedAuthDomain =
  typeof window !== 'undefined' && window.location && window.location.host
    ? window.location.host
    : firebaseConfig.authDomain;

const resolvedConfig = {
  ...firebaseConfig,
  authDomain: resolvedAuthDomain,
};

const app = !getApps().length ? initializeApp(resolvedConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize firestore with optional databaseId from config if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export default app;
