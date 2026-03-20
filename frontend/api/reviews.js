import { getFirebaseAdminDb } from "./_firebase-admin.js";

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function sanitizeText(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim();
}

function normalizeDateValue(value) {
  if (!value) {
    return "";
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function normalizeReview(id, data) {
  return {
    id,
    name: String(data?.name || "Anonymous Patient").trim() || "Anonymous Patient",
    rating: Math.max(1, Math.min(5, Number(data?.rating || 5))),
    feedback: String(data?.feedback || data?.message || "").trim(),
    status: String(data?.status || "pending").trim().toLowerCase(),
    createdAt: normalizeDateValue(data?.createdAt ?? data?.date),
    updatedAt: normalizeDateValue(data?.updatedAt),
  };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const db = getFirebaseAdminDb();
      const snapshot = await db.collection("reviews").get();
      const reviews = snapshot.docs
        .map((entry) => normalizeReview(entry.id, entry.data()))
        .filter((review) => review.feedback)
        .filter((review) => review.status === "approved")
        .sort((left, right) => {
          const leftTime = new Date(left.createdAt || 0).getTime();
          const rightTime = new Date(right.createdAt || 0).getTime();
          return rightTime - leftTime;
        });

      return json(res, 200, { reviews });
    } catch (error) {
      console.error("Review fetch API error:", error);
      return json(res, 500, { error: "Unable to load reviews" });
    }
  }

  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const name = sanitizeText(payload?.name || "Anonymous Patient") || "Anonymous Patient";
    const feedback = sanitizeText(payload?.feedback || payload?.message || "");
    const rating = Number(payload?.rating || 0);

    if (feedback.length < 20 || feedback.length > 320 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return json(res, 400, { error: "Invalid review payload" });
    }

    const db = getFirebaseAdminDb();
    const timestamp = new Date().toISOString();
    const created = await db.collection("reviews").add({
      name,
      rating,
      feedback,
      message: feedback,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp
    });

    return json(res, 200, { id: created.id, ok: true });
  } catch (error) {
    console.error("Review API error:", error);
    return json(res, 500, { error: "Unable to save review" });
  }
}
