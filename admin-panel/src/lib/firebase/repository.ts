"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase/client";
import { DEFAULT_CMS_CONTENT, DEFAULT_SERVICES } from "@/lib/constants";
import type { ActivityLog, Appointment, CmsContent, DiagnosticService, Doctor, Review } from "@/types";

type CollectionName = "doctors" | "services" | "reviews" | "appointments" | "activityLogs";

const storageKeys = {
  doctors: "hospaccx-admin-doctors",
  services: "hospaccx-admin-services",
  reviews: "hospaccx-admin-reviews",
  appointments: "hospaccx-admin-appointments",
  activityLogs: "hospaccx-admin-activity-logs",
  cms: "hospaccx-admin-cms",
};

const fallbackSeed = {
  doctors: [] as Doctor[],
  services: DEFAULT_SERVICES,
  reviews: [] as Review[],
  appointments: [] as Appointment[],
  activityLogs: [] as ActivityLog[],
  cms: DEFAULT_CMS_CONTENT,
};

function readLocalCollection<T>(key: keyof typeof storageKeys, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  const raw = window.localStorage.getItem(storageKeys[key]);
  if (!raw) {
    window.localStorage.setItem(storageKeys[key], JSON.stringify(defaultValue));
    return defaultValue;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function writeLocalCollection<T>(key: keyof typeof storageKeys, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKeys[key], JSON.stringify(value));
  }
}

function sortByUpdatedAt<T extends { updatedAt?: string; createdAt?: string }>(items: T[]) {
  return items.sort((a, b) => {
    const aDate = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const bDate = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
    return bDate - aDate;
  });
}

export async function listCollection<T extends { id: string; updatedAt?: string; createdAt?: string }>(
  name: CollectionName,
) {
  if (!isFirebaseConfigured()) {
    const local = readLocalCollection(name, fallbackSeed[name] as unknown as T[]);
    return sortByUpdatedAt(local);
  }

  const { db } = getFirebaseServices();
  const snapshot = await getDocs(query(collection(db, name), orderBy("updatedAt", "desc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);
}

export async function saveDocument<
  T extends Record<string, unknown> & { id?: string; updatedAt?: string; createdAt?: string },
>(
  name: CollectionName,
  value: T,
) {
  const timestamp = new Date().toISOString();
  const payload = {
    ...value,
    updatedAt: timestamp,
    createdAt: value.createdAt ?? timestamp,
  };

  if (!isFirebaseConfigured()) {
    const localItems = readLocalCollection(name, fallbackSeed[name] as unknown as T[]);
    const id = value.id ?? crypto.randomUUID();
    const nextItems = [...localItems.filter((item) => item.id !== id), { ...payload, id }] as T[];
    writeLocalCollection(name, sortByUpdatedAt(nextItems));
    return { ...payload, id } as T & { id: string };
  }

  const { db } = getFirebaseServices();
  if (value.id) {
    await setDoc(doc(db, name, value.id), payload, { merge: true });
    return { ...payload, id: value.id } as T & { id: string };
  }

  const created = await addDoc(collection(db, name), payload);
  return { ...payload, id: created.id } as T & { id: string };
}

export async function deleteDocument(name: CollectionName, id: string) {
  if (!isFirebaseConfigured()) {
    const localItems = readLocalCollection(name, fallbackSeed[name] as unknown as { id: string }[]);
    writeLocalCollection(
      name,
      localItems.filter((item) => item.id !== id),
    );
    return;
  }

  const { db } = getFirebaseServices();
  await deleteDoc(doc(db, name, id));
}

export async function loadCmsContent() {
  if (!isFirebaseConfigured()) {
    return readLocalCollection("cms", DEFAULT_CMS_CONTENT);
  }

  const { db } = getFirebaseServices();
  const snapshot = await getDoc(doc(db, "cms", "website"));
  if (!snapshot.exists()) {
    await setDoc(doc(db, "cms", "website"), DEFAULT_CMS_CONTENT);
    return DEFAULT_CMS_CONTENT;
  }

  return snapshot.data() as CmsContent;
}

export async function saveCmsContent(content: CmsContent) {
  if (!isFirebaseConfigured()) {
    writeLocalCollection("cms", content);
    return content;
  }

  const { db } = getFirebaseServices();
  await setDoc(doc(db, "cms", "website"), {
    ...content,
    updatedAt: new Date().toISOString(),
  });
  return content;
}

export async function uploadImage(file: File, path: string) {
  if (!isFirebaseConfigured()) {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  }

  const { storage } = getFirebaseServices();
  const objectRef = ref(storage, path);
  await uploadBytes(objectRef, file);
  return getDownloadURL(objectRef);
}

export async function addActivityLog(log: Omit<ActivityLog, "id" | "createdAt">) {
  await saveDocument("activityLogs", {
    ...log,
    createdAt: new Date().toISOString(),
  });
}
