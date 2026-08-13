import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let firebaseApp: App | undefined;
let isFirebaseInitialized = false;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (getApps().length === 0) {
    if (projectId && clientEmail && privateKey) {
      firebaseApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      isFirebaseInitialized = true;
      console.log('[Firebase Admin] Initialized successfully with Service Account credentials');
    } else if (projectId) {
      firebaseApp = initializeApp({ projectId });
      isFirebaseInitialized = true;
      console.log(`[Firebase Admin] Initialized with Project ID: ${projectId}`);
    } else {
      firebaseApp = initializeApp();
      isFirebaseInitialized = true;
    }
  } else {
    firebaseApp = getApps()[0];
    isFirebaseInitialized = true;
  }
} catch (err: any) {
  console.warn('[Firebase Admin] Initialization warning (running in fallback mode):', err.message);
}

export const getFirebaseAuth = (): Auth => {
  return getAuth(firebaseApp);
};

export { isFirebaseInitialized };
