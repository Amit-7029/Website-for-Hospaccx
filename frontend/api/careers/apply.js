import { getFirebaseAdminDb, getFirebaseAdminServices, getFirebaseAdminStorageCandidates } from "../_firebase-admin.js";

const MAX_INLINE_RESUME_BYTES = 700 * 1024;
const MAX_RESUME_BYTES = 4 * 1024 * 1024;

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

function sanitizeFileName(name) {
  return sanitizeText(name).replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function buildDownloadUrl(bucketName, objectPath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

function decodeDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid resume file");
  }

  return {
    mimeType: match[1],
    bytes: Buffer.from(match[2], "base64"),
  };
}

async function uploadResume(bytes, fileName, mimeType) {
  const { storage } = getFirebaseAdminServices();
  const safeFileName = sanitizeFileName(fileName || "resume.pdf") || "resume.pdf";
  const objectPath = `resumes/${Date.now()}-${safeFileName}`;
  const downloadToken = crypto.randomUUID();
  let lastError = null;

  for (const bucketName of getFirebaseAdminStorageCandidates()) {
    try {
      const bucket = storage.bucket(bucketName);
      await bucket.file(objectPath).save(bytes, {
        resumable: false,
        metadata: {
          contentType: mimeType,
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });

      return {
        resumeUrl: buildDownloadUrl(bucket.name, objectPath, downloadToken),
        resumeStorageMode: "storage",
      };
    } catch (error) {
      lastError = error;
    }
  }

  if (bytes.length <= MAX_INLINE_RESUME_BYTES) {
    return {
      resumeUrl: `data:${mimeType};base64,${bytes.toString("base64")}`,
      resumeStorageMode: "inline",
    };
  }

  throw lastError ?? new Error("Unable to upload resume");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const jobId = sanitizeText(payload?.jobId);
    const name = sanitizeText(payload?.name);
    const email = sanitizeText(payload?.email);
    const phone = sanitizeText(payload?.phone);
    const message = sanitizeText(payload?.message);
    const resumeName = sanitizeFileName(payload?.resumeName || "resume.pdf");
    const resumeDataUrl = String(payload?.resumeDataUrl || "");

    if (!jobId || name.length < 2 || !email.includes("@") || phone.length < 8 || !resumeDataUrl) {
      return json(res, 400, { error: "Invalid application payload" });
    }

    const { mimeType, bytes } = decodeDataUrl(resumeDataUrl);
    if (mimeType !== "application/pdf") {
      return json(res, 400, { error: "Resume must be a PDF" });
    }

    if (bytes.length > MAX_RESUME_BYTES) {
      return json(res, 400, { error: "Resume must be under 4 MB" });
    }

    const db = getFirebaseAdminDb();
    const jobSnapshot = await db.collection("jobs").doc(jobId).get();
    if (!jobSnapshot.exists) {
      return json(res, 404, { error: "Job opening not found" });
    }

    const jobData = jobSnapshot.data() || {};
    if (String(jobData.status || "inactive").trim().toLowerCase() !== "active") {
      return json(res, 400, { error: "This job is no longer accepting applications" });
    }

    const uploadResult = await uploadResume(bytes, resumeName, mimeType);
    const timestamp = new Date().toISOString();
    const created = await db.collection("applications").add({
      jobId,
      jobTitle: sanitizeText(jobData.title),
      name,
      email,
      phone,
      resumeUrl: uploadResult.resumeUrl,
      resumeName,
      resumeStorageMode: uploadResult.resumeStorageMode,
      message,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await db.collection("notifications").add({
      title: "New career application",
      message: `${name} applied for ${sanitizeText(jobData.title)}.`,
      type: "career",
      entityId: created.id,
      entityType: "application",
      read: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return json(res, 200, { ok: true, id: created.id });
  } catch (error) {
    console.error("Career apply API error:", error);
    return json(res, 500, { error: "Unable to submit application" });
  }
}
