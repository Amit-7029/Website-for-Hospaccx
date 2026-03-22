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

  try {
    const department = sanitizeText(req.query?.department);
    const jobType = sanitizeText(req.query?.jobType);
    const db = getFirebaseAdminDb();
    const snapshot = await db.collection("jobs").get();
    const jobs = snapshot.docs
      .map((entry) => normalizeJob(entry.id, entry.data()))
      .filter((job) => job.status === "active")
      .filter((job) => (department ? job.department.toLowerCase() === department.toLowerCase() : true))
      .filter((job) => (jobType ? job.jobType.toLowerCase() === jobType.toLowerCase() : true))
      .sort((left, right) => {
        const leftTime = new Date(left.updatedAt || left.createdAt || 0).getTime();
        const rightTime = new Date(right.updatedAt || right.createdAt || 0).getTime();
        return rightTime - leftTime;
      });

    return json(res, 200, { jobs });
  } catch (error) {
    console.error("Career jobs API error:", error);
    return json(res, 500, { error: "Unable to load jobs" });
  }
}
