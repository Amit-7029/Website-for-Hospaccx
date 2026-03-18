import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let app: FirebaseApp | null = null;

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Object.values(config).every(Boolean);
}

export function getFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase client configuration is missing");
  }

  if (app) {
    return app;
  }

  app = getApps().length ? getApp() : initializeApp(getFirebaseConfig());
  return app;
}

export function getFirebaseServices() {
  const firebaseApp = getFirebaseApp();

  return {
    app: firebaseApp,
    auth: getAuth(firebaseApp),
    db: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp),
  };
}
