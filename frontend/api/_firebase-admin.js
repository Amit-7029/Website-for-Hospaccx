import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function cleanEnvValue(value) {
  return typeof value === "string" ? value.trim() : value;
}

function resolveProjectId() {
  return (
    cleanEnvValue(process.env.FIREBASE_PROJECT_ID) ||
    cleanEnvValue(process.env.VITE_FIREBASE_PROJECT_ID) ||
    cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  );
}

function getPrivateKey() {
  const privateKey = cleanEnvValue(process.env.FIREBASE_PRIVATE_KEY);
  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY is not configured.");
  }

  return privateKey.replace(/\\n/g, "\n");
}

export function getFirebaseAdminDb() {
  return getFirebaseAdminServices().db;
}

function resolveStorageBucket() {
  const explicitBucket =
    cleanEnvValue(process.env.FIREBASE_STORAGE_BUCKET) ||
    cleanEnvValue(process.env.VITE_FIREBASE_STORAGE_BUCKET) ||
    cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

  if (explicitBucket) {
    return explicitBucket;
  }

  const projectId = resolveProjectId();
  return projectId ? `${projectId}.firebasestorage.app` : undefined;
}

export function getFirebaseAdminServices() {
  if (!getApps().length) {
    const clientEmail = cleanEnvValue(process.env.FIREBASE_CLIENT_EMAIL);
    const projectId = resolveProjectId();
    const storageBucket = resolveStorageBucket();

    if (!clientEmail || !projectId) {
      throw new Error("Firebase admin environment variables are missing.");
    }

    initializeApp({
      credential: cert({
        clientEmail,
        privateKey: getPrivateKey(),
        projectId
      }),
      storageBucket
    });
  }

  const app = getApp();

  return {
    db: getFirestore(app),
    storage: getStorage(app),
  };
}

export function getFirebaseAdminStorageCandidates() {
  const projectId = resolveProjectId();
  return [
    cleanEnvValue(process.env.FIREBASE_STORAGE_BUCKET),
    cleanEnvValue(process.env.VITE_FIREBASE_STORAGE_BUCKET),
    cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    projectId ? `${projectId}.firebasestorage.app` : undefined,
    projectId ? `${projectId}.appspot.com` : undefined
  ].filter(Boolean);
}
