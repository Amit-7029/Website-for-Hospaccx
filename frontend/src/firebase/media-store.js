import { collection, getDocs } from "firebase/firestore";
import { fallbackMediaItems } from "../data/media";
import { getFirebaseServices, isFirebaseConfigured } from "./client";

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

function mergeMediaItems(remoteItems) {
  const merged = [];
  const seen = new Set();

  [...remoteItems, ...fallbackMediaItems.map(normalizeMediaItem)].forEach((item) => {
    const normalized = normalizeMediaItem(item);
    const key = mediaSlotKey(normalized);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(normalized);
    }
  });

  return sortMediaItems(merged);
}

export async function loadMediaItems() {
  if (!isFirebaseConfigured()) {
    return {
      items: sortMediaItems(fallbackMediaItems.map(normalizeMediaItem)),
      source: "local"
    };
  }

  const { firestore } = getFirebaseServices();
  if (!firestore) {
    return {
      items: sortMediaItems(fallbackMediaItems.map(normalizeMediaItem)),
      source: "local"
    };
  }

  try {
    const snapshot = await getDocs(collection(firestore, "media"));
    const remoteItems = sortMediaItems(snapshot.docs.map((entry, index) => normalizeMediaItem({ id: entry.id, ...entry.data() }, index)));

    return {
      items: remoteItems.length ? mergeMediaItems(remoteItems) : sortMediaItems(fallbackMediaItems.map(normalizeMediaItem)),
      source: remoteItems.length ? "firestore" : "local"
    };
  } catch (error) {
    console.error("Unable to load media from Firestore, falling back to local media.", error);
    return {
      items: sortMediaItems(fallbackMediaItems.map(normalizeMediaItem)),
      source: "local"
    };
  }
}
