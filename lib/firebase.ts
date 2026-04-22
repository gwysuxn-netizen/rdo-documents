import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let database: Database | null = null;
let storage: FirebaseStorage | null = null;

const initializeFirebase = () => {
  // Check if already initialized
  if (app) return { app, auth, database, storage };

  // Only initialize if we have environments variables (client-side)
  if (typeof window === 'undefined') {
    return { app: null, auth: null, database: null, storage: null };
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  try {
    // Check if Firebase app is already initialized
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
    } else {
      app = initializeApp(firebaseConfig);
    }

    auth = getAuth(app);
    database = getDatabase(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }

  return { app, auth, database, storage };
};

export const getFirebaseAuth = (): Auth | null => {
  const { auth: authInstance } = initializeFirebase();
  return authInstance;
};

export const getFirebaseDatabase = (): Database | null => {
  const { database: dbInstance } = initializeFirebase();
  return dbInstance;
};

export const getFirebaseStorage = (): FirebaseStorage | null => {
  const { storage: storageInstance } = initializeFirebase();
  return storageInstance;
};

// For backward compatibility
export { getAuth } from 'firebase/auth';
export { getDatabase } from 'firebase/database';
export { getStorage } from 'firebase/storage';
