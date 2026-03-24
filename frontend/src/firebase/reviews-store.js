import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from "firebase/firestore";
import { testimonials as fallbackTestimonials } from "../data/content";
import { getFirebaseServices, isFirebaseConfigured } from "./client";
import { getRuntimePerformanceProfile, readCachedResource, writeCachedResource } from "../utils/runtime-performance";

const COLLECTION_NAME = "reviews";
const REVIEWS_CACHE_KEY = "reviews";
const REVIEWS_CACHE_MAX_AGE_MS = 1000 * 60 * 10;

function reviewsCollection() {
  const { firestore } = getFirebaseServices();
  return firestore ? collection(firestore, COLLECTION_NAME) : null;
}

function formatReviewDate(value) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function normalizeReview(id, data, fallbackIndex = 0) {
  const createdAt = data.createdAt?.toDate?.() ?? data.createdAt ?? data.date ?? null;

  return {
    id: id ?? `review-${fallbackIndex + 1}`,
    name: data.name?.trim?.() || "Anonymous Patient",
    rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
    feedback: String(data.feedback ?? data.message ?? "").trim(),
    date: formatReviewDate(createdAt),
    status: String(data.status || "").trim().toLowerCase()
  };
}

export async function loadReviews() {
  const cached = readCachedResource(REVIEWS_CACHE_KEY, REVIEWS_CACHE_MAX_AGE_MS);
  const runtime = getRuntimePerformanceProfile();
  if (cached?.isFresh) {
    return cached.data;
  }

  try {
    const response = await fetch("/api/reviews", {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: runtime.lowDataMode ? "force-cache" : "no-store"
    });

    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload?.reviews)) {
        const apiReviews = payload.reviews
          .map((item, index) => normalizeReview(item.id, item, index))
          .filter((review) => review.feedback);

        const result = {
          reviews: apiReviews,
          source: "firestore"
        };
        writeCachedResource(REVIEWS_CACHE_KEY, result);
        return result;
      }
    }
  } catch (error) {
    console.error("Review API read fallback triggered:", error);
    if (cached?.data) {
      return cached.data;
    }
  }

  if (!isFirebaseConfigured()) {
    const localResult = {
      reviews: fallbackTestimonials.map((item, index) => normalizeReview(`local-${index + 1}`, item, index)),
      source: "local"
    };
    writeCachedResource(REVIEWS_CACHE_KEY, localResult);
    return localResult;
  }

  const collectionRef = reviewsCollection();
  if (!collectionRef) {
    const localResult = {
      reviews: fallbackTestimonials.map((item, index) => normalizeReview(`local-${index + 1}`, item, index)),
      source: "local"
    };
    writeCachedResource(REVIEWS_CACHE_KEY, localResult);
    return localResult;
  }

  const snapshot = await getDocs(query(collectionRef, orderBy("createdAt", "desc")));
  const remoteReviews = snapshot.docs
    .map((entry, index) => normalizeReview(entry.id, entry.data(), index))
    .filter((review) => review.feedback)
    .filter((review) => !review.status || review.status === "approved");

  const result = {
    reviews: remoteReviews.length
      ? remoteReviews
      : fallbackTestimonials.map((item, index) => normalizeReview(`local-${index + 1}`, item, index)),
    source: remoteReviews.length ? "firestore" : "local"
  };
  writeCachedResource(REVIEWS_CACHE_KEY, result);
  return result;
}

export async function createReview(payload) {
  try {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: payload.name,
        rating: payload.rating,
        feedback: payload.feedback
      }),
      cache: "no-store"
    });

    if (response.ok) {
      const result = await response.json();
      return normalizeReview(result.id, {
        ...payload,
        createdAt: new Date(),
        status: "pending"
      });
    }
  } catch (error) {
    console.error("Review API fallback triggered:", error);
  }

  if (!isFirebaseConfigured()) {
    return {
      id: `local-${Date.now()}`,
      ...normalizeReview(null, { ...payload, createdAt: new Date(), status: "pending" })
    };
  }

  const collectionRef = reviewsCollection();
  if (!collectionRef) {
    throw new Error("Firebase Firestore is not configured.");
  }

  const created = await addDoc(collectionRef, {
    name: payload.name?.trim() || "Anonymous Patient",
    rating: payload.rating,
    feedback: payload.feedback.trim(),
    status: "pending",
    createdAt: serverTimestamp()
  });

  return normalizeReview(created.id, {
    ...payload,
    createdAt: new Date(),
    status: "pending"
  });
}
