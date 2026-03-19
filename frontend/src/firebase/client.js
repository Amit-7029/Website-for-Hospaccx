import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function cleanEnvValue(value) {
  return typeof value === "string" ? value.trim() : value;
}

const firebaseConfig = {
  apiKey: cleanEnvValue(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnvValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnvValue(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnvValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnvValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnvValue(import.meta.env.VITE_FIREBASE_APP_ID)
};

export function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every(Boolean);
}

let app;
let firestore;
let storage;

export function getFirebaseServices() {
  if (!isFirebaseConfigured()) {
    return { app: null, firestore: null, storage: null };
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    storage = getStorage(app);
  }

  return { app, firestore, storage };
}
