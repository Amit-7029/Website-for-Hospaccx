import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
  if (!getApps().length) {
    const clientEmail = cleanEnvValue(process.env.FIREBASE_CLIENT_EMAIL);
    const projectId = resolveProjectId();

    if (!clientEmail || !projectId) {
      throw new Error("Firebase admin environment variables are missing.");
    }

    initializeApp({
      credential: cert({
        clientEmail,
        privateKey: getPrivateKey(),
        projectId
      })
    });
  }

  return getFirestore(getApp());
}
