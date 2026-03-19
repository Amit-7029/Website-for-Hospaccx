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
    const name = String(payload?.name || "").trim();
    const phone = String(payload?.phone || "").trim();
    const date = String(payload?.date || "").trim();
    const doctor = String(payload?.doctor || "").trim();
    const message = String(payload?.message || "").trim();

    if (name.length < 2 || phone.length < 8 || date.length < 10) {
      return json(res, 400, { error: "Invalid appointment payload" });
    }

    const db = getFirebaseAdminDb();
    const timestamp = new Date().toISOString();
    const created = await db.collection("appointments").add({
      name,
      phone,
      date,
      doctor,
      message,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp
    });

    return json(res, 200, { id: created.id, ok: true });
  } catch (error) {
    console.error("Appointment API error:", error);
    return json(res, 500, { error: "Unable to save appointment" });
  }
}
