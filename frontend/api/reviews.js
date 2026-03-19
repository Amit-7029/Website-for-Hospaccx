import { getFirebaseAdminDb } from "./_firebase-admin.js";

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const name = String(payload?.name || "Anonymous Patient").trim() || "Anonymous Patient";
    const feedback = String(payload?.feedback || payload?.message || "").trim();
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
