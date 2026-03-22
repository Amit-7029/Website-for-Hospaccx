import { getFirebaseAdminDb } from "../_firebase-admin.js";

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

function normalizeJob(id, data) {
  return {
    id,
    title: sanitizeText(data?.title),
    department: sanitizeText(data?.department),
    location: sanitizeText(data?.location),
    experience: sanitizeText(data?.experience),
    jobType: sanitizeText(data?.jobType || "full-time") || "full-time",
    shortDescription: sanitizeText(data?.shortDescription),
    description: sanitizeText(data?.description),
    requirements: Array.isArray(data?.requirements)
      ? data.requirements.map((item) => sanitizeText(item)).filter(Boolean)
      : [],
    status: sanitizeText(data?.status || "inactive") || "inactive",
    createdAt: normalizeDateValue(data?.createdAt),
    updatedAt: normalizeDateValue(data?.updatedAt),
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  const id = sanitizeText(req.query?.id);
  if (!id) {
    return json(res, 400, { error: "Job id is required" });
  }

  try {
    const db = getFirebaseAdminDb();
    const snapshot = await db.collection("jobs").doc(id).get();
    if (!snapshot.exists) {
      return json(res, 404, { error: "Job not found" });
    }

    const job = normalizeJob(snapshot.id, snapshot.data());
    if (job.status !== "active") {
      return json(res, 404, { error: "Job not available" });
    }

    return json(res, 200, { job });
  } catch (error) {
    console.error("Career job detail API error:", error);
    return json(res, 500, { error: "Unable to load job" });
  }
}
