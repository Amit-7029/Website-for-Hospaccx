import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getPrivateKey() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY is not configured");
  }

  return privateKey.replace(/\\n/g, "\n");
}

function getAdminApp() {
  if (getApps().length) {
    return getApp();
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  if (!clientEmail || !projectId) {
    throw new Error("Firebase admin credentials are not configured");
  }

  return initializeApp({
    credential: cert({
      clientEmail,
      privateKey: getPrivateKey(),
      projectId,
    }),
    storageBucket,
  });
}

export function getFirebaseAdminServices() {
  const app = getAdminApp();

  return {
    auth: getAuth(app),
    db: getFirestore(app),
    storage: getStorage(app),
  };
}
