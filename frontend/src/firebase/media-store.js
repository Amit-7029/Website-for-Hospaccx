import { collection, getDocs } from "firebase/firestore";
import { fallbackMediaItems } from "../data/media";
import { getFirebaseServices, isFirebaseConfigured } from "./client";
import { getRuntimePerformanceProfile, readCachedResource, writeCachedResource } from "../utils/runtime-performance";

const FIRESTORE_MEDIA_ENDPOINT = "https://firestore.googleapis.com/v1/projects";
const DEFAULT_FIREBASE_PROJECT_ID = "hospaccx-admin";
const MEDIA_CACHE_KEY = "media-items-v2";
const MEDIA_CACHE_MAX_AGE_MS = 1000 * 60 * 20;

function normalizeMediaItem(item, index = 0) {
  return {
    id: item.id ?? `media-${index + 1}`,
    title: String(item.title || "").trim(),
    caption: String(item.caption || "").trim(),
    alt: String(item.alt || item.title || "Hospaccx media").trim(),
    imageUrl: String(item.imageUrl || "").trim(),
    section: String(item.section || "gallery").trim(),
    category: String(item.category || "Infrastructure").trim(),
    ctaLabel: String(item.ctaLabel || "").trim(),
    ctaLink: String(item.ctaLink || "").trim(),
    order: Number(item.order ?? index + 1) || index + 1
  };
}

function sortMediaItems(items) {
  return [...items].sort((left, right) => {
    if (left.section !== right.section) {
      return left.section.localeCompare(right.section);
    }

    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.title.localeCompare(right.title);
  });
}

function mediaSlotKey(item) {
  return `${String(item.section || "").trim()}:${Number(item.order ?? 0)}`;
}

function getTimestampValue(item) {
  return new Date(item.updatedAt || item.createdAt || 0).getTime();
}

function dedupeMediaItems(items) {
  const latestBySlot = new Map();

  items.forEach((item) => {
    const normalized = normalizeMediaItem(item);
    const slotKey = mediaSlotKey(normalized);
    const current = latestBySlot.get(slotKey);
    if (!current || getTimestampValue(normalized) >= getTimestampValue(current)) {
      latestBySlot.set(slotKey, normalized);
    }
  });

  return sortMediaItems([...latestBySlot.values()]);
}

function readRestFieldValue(field) {
  if (!field || typeof field !== "object") {
    return "";
  }

  if ("stringValue" in field) {
    return field.stringValue;
  }

  if ("integerValue" in field) {
    return Number(field.integerValue);
  }

  if ("doubleValue" in field) {
    return Number(field.doubleValue);
  }

  if ("booleanValue" in field) {
    return Boolean(field.booleanValue);
  }

  return "";
}

async function loadMediaItemsFromRest(projectId) {
  if (!projectId || typeof fetch !== "function") {
    return [];
  }

  const response = await fetch(
    `${FIRESTORE_MEDIA_ENDPOINT}/${encodeURIComponent(projectId)}/databases/(default)/documents/media?t=${Date.now()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Media REST request failed with ${response.status}`);
  }

  const payload = await response.json();
  const documents = Array.isArray(payload?.documents) ? payload.documents : [];

  return documents.map((document, index) =>
    normalizeMediaItem(
      {
        id: String(document?.name || "").split("/").pop() || `media-${index + 1}`,
        title: readRestFieldValue(document?.fields?.title),
        caption: readRestFieldValue(document?.fields?.caption),
        alt: readRestFieldValue(document?.fields?.alt),
        imageUrl: readRestFieldValue(document?.fields?.imageUrl),
        section: readRestFieldValue(document?.fields?.section),
        category: readRestFieldValue(document?.fields?.category),
        ctaLabel: readRestFieldValue(document?.fields?.ctaLabel),
        ctaLink: readRestFieldValue(document?.fields?.ctaLink),
        order: readRestFieldValue(document?.fields?.order),
        createdAt: readRestFieldValue(document?.fields?.createdAt),
        updatedAt: readRestFieldValue(document?.fields?.updatedAt)
      },
      index
    )
  );
}

export async function loadMediaItems() {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;
  const cached = readCachedResource(MEDIA_CACHE_KEY, MEDIA_CACHE_MAX_AGE_MS);
  const runtime = getRuntimePerformanceProfile();

  try {
    const restItems = await loadMediaItemsFromRest(projectId);
    if (restItems.length) {
      const result = {
        items: dedupeMediaItems(restItems),
        source: "firestore"
      };
      writeCachedResource(MEDIA_CACHE_KEY, result);
      return result;
    }
  } catch (error) {
    console.warn("Unable to load media through Firestore REST, falling back to SDK/local media.", error);
    if (cached?.data) {
      return cached.data;
    }
  }

  if (!isFirebaseConfigured()) {
    const localResult = {
      items: dedupeMediaItems(fallbackMediaItems),
      source: "local"
    };
    writeCachedResource(MEDIA_CACHE_KEY, localResult);
    return localResult;
  }

  const { firestore } = getFirebaseServices();
  if (!firestore) {
    const localResult = {
      items: dedupeMediaItems(fallbackMediaItems),
      source: "local"
    };
    writeCachedResource(MEDIA_CACHE_KEY, localResult);
    return localResult;
  }

  try {
    const snapshot = await getDocs(collection(firestore, "media"));
    const remoteItems = sortMediaItems(snapshot.docs.map((entry, index) => normalizeMediaItem({ id: entry.id, ...entry.data() }, index)));

    const result = {
      items: remoteItems.length ? dedupeMediaItems(remoteItems) : dedupeMediaItems(fallbackMediaItems),
      source: remoteItems.length ? "firestore" : "local"
    };
    writeCachedResource(MEDIA_CACHE_KEY, result);
    return result;
  } catch (error) {
    console.error("Unable to load media from Firestore, falling back to local media.", error);
    if (cached?.data) {
      return cached.data;
    }

    const localResult = {
      items: dedupeMediaItems(fallbackMediaItems),
      source: "local"
    };
    writeCachedResource(MEDIA_CACHE_KEY, localResult);
    return localResult;
  }
}
