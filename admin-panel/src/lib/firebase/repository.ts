"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseServices, isFirebaseConfigured } from "@/lib/firebase/client";
import { DEFAULT_CMS_CONTENT, DEFAULT_HERO_CONTENT, DEFAULT_SERVICES } from "@/lib/constants";
import type {
  ActivityLog,
  Appointment,
  CmsContent,
  DiagnosticService,
  Doctor,
  HeroContent,
  MediaItem,
  NotificationItem,
  RoleRecord,
  Review,
  UserRecord,
} from "@/types";

type CollectionName =
  | "doctors"
  | "services"
  | "reviews"
  | "appointments"
  | "activityLogs"
  | "media"
  | "notifications"
  | "roles"
  | "users";

const storageKeys = {
  doctors: "hospaccx-admin-doctors",
  services: "hospaccx-admin-services",
  reviews: "hospaccx-admin-reviews",
  appointments: "hospaccx-admin-appointments",
  activityLogs: "hospaccx-admin-activity-logs",
  media: "hospaccx-admin-media",
  notifications: "hospaccx-admin-notifications",
  roles: "hospaccx-admin-roles",
  users: "hospaccx-admin-users",
  cms: "hospaccx-admin-cms",
  heroContent: "hospaccx-admin-hero-content",
};

const fallbackSeed = {
  doctors: [] as Doctor[],
  services: DEFAULT_SERVICES,
  reviews: [] as Review[],
  appointments: [] as Appointment[],
  activityLogs: [] as ActivityLog[],
  media: [] as MediaItem[],
  notifications: [] as NotificationItem[],
  roles: [] as RoleRecord[],
  users: [] as UserRecord[],
  cms: DEFAULT_CMS_CONTENT,
  heroContent: DEFAULT_HERO_CONTENT,
};

const MAX_INLINE_IMAGE_BYTES = 340 * 1024;
const MAX_IMAGE_WIDTH = 1600;
const MAX_IMAGE_HEIGHT = 1200;

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

function fileToDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to process image"));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to compress image"));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

async function createInlineUploadImage(file: File) {
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    if (file.size > MAX_INLINE_IMAGE_BYTES) {
      throw new Error("Please use a JPG or PNG image under 340 KB for storage-free uploads.");
    }

    return fileToDataUrl(file);
  }

  const source = await loadImageFromFile(file);
  const ratio = Math.min(MAX_IMAGE_WIDTH / source.width, MAX_IMAGE_HEIGHT / source.height, 1);
  const width = Math.max(1, Math.round(source.width * ratio));
  const height = Math.max(1, Math.round(source.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Your browser could not process this image");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);

  let blob = await canvasToBlob(canvas, 0.86);
  const qualities = [0.8, 0.72, 0.64, 0.56, 0.48, 0.4];

  for (const quality of qualities) {
    if (blob.size <= MAX_INLINE_IMAGE_BYTES) {
      break;
    }

    blob = await canvasToBlob(canvas, quality);
  }

  if (blob.size > MAX_INLINE_IMAGE_BYTES) {
    throw new Error("Image is still too large after optimization. Please use a smaller image.");
  }

  return fileToDataUrl(blob);
}

function sortByUpdatedAt<T extends { updatedAt?: string; createdAt?: string }>(items: T[]) {
  return items.sort((a, b) => {
    const aDate = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const bDate = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
    return bDate - aDate;
  });
}

function normalizeDateValue(value: unknown) {
  if (value && typeof value === "object" && "toDate" in (value as Record<string, unknown>)) {
    return ((value as { toDate: () => Date }).toDate()).toISOString();
  }

  return typeof value === "string" ? value : undefined;
}

function stripUndefinedValues<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)) as T;
}

function normalizeCollectionItem<T extends { id: string }>(name: CollectionName, item: T): T {
  if (name === "reviews") {
    const record = item as T & { feedback?: string; message?: string; createdAt?: unknown; updatedAt?: unknown };
    return {
      ...record,
      message: String(record.message ?? record.feedback ?? "").trim(),
      feedback: String(record.feedback ?? record.message ?? "").trim(),
      createdAt: normalizeDateValue(record.createdAt),
      updatedAt: normalizeDateValue(record.updatedAt),
    } as T;
  }

  if (name === "appointments") {
    const record = item as T & { createdAt?: unknown; updatedAt?: unknown; date?: unknown };
    return {
      ...record,
      createdAt: normalizeDateValue(record.createdAt),
      updatedAt: normalizeDateValue(record.updatedAt),
      date: normalizeDateValue(record.date) ?? String(record.date ?? ""),
    } as T;
  }

  const record = item as T & { createdAt?: unknown; updatedAt?: unknown };
  return {
    ...record,
    createdAt: normalizeDateValue(record.createdAt),
    updatedAt: normalizeDateValue(record.updatedAt),
  } as T;
}

export async function listCollection<T extends { id: string; updatedAt?: string; createdAt?: string }>(
  name: CollectionName,
  options?: {
    includeSystem?: boolean;
  },
) {
  if (!isFirebaseConfigured()) {
    const local = readLocalCollection(name, fallbackSeed[name] as unknown as T[]);
    const sorted = sortByUpdatedAt(local);
    return options?.includeSystem ? sorted : sorted.filter((item) => !(item as T & { system?: boolean }).system);
  }

  const { db } = getFirebaseServices();
  const snapshot = await getDocs(collection(db, name));
  const items = snapshot.docs.map((item) => normalizeCollectionItem(name, { id: item.id, ...item.data() } as T));
  const filteredItems = options?.includeSystem ? items : items.filter((item) => !(item as T & { system?: boolean }).system);
  return sortByUpdatedAt(filteredItems);
}

export async function saveDocument<
  T extends Record<string, unknown> & { id?: string; updatedAt?: string; createdAt?: string },
>(
  name: CollectionName,
  value: T,
) {
  const timestamp = new Date().toISOString();
  const payload = stripUndefinedValues({
    ...value,
    updatedAt: timestamp,
    createdAt: value.createdAt ?? timestamp,
  });

  if (!isFirebaseConfigured()) {
    const localItems = readLocalCollection(name, fallbackSeed[name] as unknown as T[]);
    const id = value.id ?? crypto.randomUUID();
    const nextItems = [...localItems.filter((item) => item.id !== id), stripUndefinedValues({ ...payload, id })] as T[];
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

export async function deleteMediaSlot(section: string, order: number) {
  if (!isFirebaseConfigured()) {
    const localItems = readLocalCollection("media", fallbackSeed.media as MediaItem[]);
    writeLocalCollection(
      "media",
      localItems.filter((item) => !(String(item.section) === String(section) && Number(item.order) === Number(order))),
    );
    return;
  }

  const { db } = getFirebaseServices();
  const snapshot = await getDocs(query(collection(db, "media"), where("section", "==", section), where("order", "==", Number(order))));

  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((item) => {
    batch.delete(item.ref);
  });
  await batch.commit();
}

export async function loadCmsContent() {
  if (!isFirebaseConfigured()) {
    return {
      ...DEFAULT_CMS_CONTENT,
      ...readLocalCollection("cms", DEFAULT_CMS_CONTENT),
    };
  }

  const { db } = getFirebaseServices();
  const snapshot = await getDoc(doc(db, "cms", "website"));
  if (!snapshot.exists()) {
    await setDoc(doc(db, "cms", "website"), DEFAULT_CMS_CONTENT);
    return DEFAULT_CMS_CONTENT;
  }

  return {
    ...DEFAULT_CMS_CONTENT,
    ...(snapshot.data() as Partial<CmsContent>),
  } as CmsContent;
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

export async function loadHeroContent() {
  if (typeof fetch === "function") {
    const response = await fetch("/api/content/hero", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Unable to load hero content");
    }

    const payload = (await response.json()) as Partial<HeroContent>;
    return {
      ...DEFAULT_HERO_CONTENT,
      ...payload,
    } as HeroContent;
  }

  if (!isFirebaseConfigured()) {
    return {
      ...DEFAULT_HERO_CONTENT,
      ...readLocalCollection("heroContent", DEFAULT_HERO_CONTENT),
    } as HeroContent;
  }

  const { db } = getFirebaseServices();
  const snapshot = await getDoc(doc(db, "content", "hero"));
  if (!snapshot.exists()) {
    return DEFAULT_HERO_CONTENT;
  }

  return {
    ...DEFAULT_HERO_CONTENT,
    ...(snapshot.data() as Partial<HeroContent>),
  } as HeroContent;
}

export async function saveHeroContent(content: HeroContent) {
  if (typeof fetch === "function") {
    const response = await fetch("/api/content/hero", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(content),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Unable to save hero content");
    }

    const payload = (await response.json()) as Partial<HeroContent>;
    return {
      ...DEFAULT_HERO_CONTENT,
      ...payload,
    } as HeroContent;
  }

  const timestamp = new Date().toISOString();
  const payload = stripUndefinedValues({
    ...content,
    updatedAt: timestamp,
    createdAt: content.createdAt ?? timestamp,
  });

  if (!isFirebaseConfigured()) {
    writeLocalCollection("heroContent", payload);
    writeLocalCollection("cms", {
      ...readLocalCollection("cms", DEFAULT_CMS_CONTENT),
      heroHeading: content.heading,
      heroDescription: content.subheading,
      heroPrimaryCtaLabel: content.primaryButtonText,
      heroSecondaryCtaLabel: content.secondaryButtonText,
    });
    return payload as HeroContent;
  }

  const { db } = getFirebaseServices();
  const batch = writeBatch(db);
  batch.set(doc(db, "content", "hero"), payload, { merge: true });
  batch.set(
    doc(db, "cms", "website"),
    {
      heroHeading: content.heading,
      heroDescription: content.subheading,
      heroPrimaryCtaLabel: content.primaryButtonText,
      heroSecondaryCtaLabel: content.secondaryButtonText,
      updatedAt: timestamp,
    },
    { merge: true },
  );
  await batch.commit();

  return payload as HeroContent;
}

export async function uploadImage(file: File, path: string) {
  void path;
  void isFirebaseConfigured();
  return createInlineUploadImage(file);
}

export async function addActivityLog(log: Omit<ActivityLog, "id" | "createdAt">) {
  await saveDocument("activityLogs", {
    ...log,
    createdAt: new Date().toISOString(),
  });
}
