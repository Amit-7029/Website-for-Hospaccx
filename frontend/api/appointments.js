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

function isTermsAccepted(value) {
  return value === true || value === "true" || value === "on" || value === 1 || value === "1";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const name = sanitizeText(payload?.name);
    const phone = sanitizeText(payload?.phone);
    const date = sanitizeText(payload?.date);
    const doctor = sanitizeText(payload?.doctor);
    const doctorId = sanitizeText(payload?.doctorId);
    const department = sanitizeText(payload?.department);
    const selectedDate = sanitizeText(payload?.selectedDate);
    const selectedTime = sanitizeText(payload?.selectedTime);
    const message = sanitizeText(payload?.message);
    const termsAccepted = isTermsAccepted(payload?.termsAccepted);

    if (name.length < 2 || phone.length < 8 || date.length < 10) {
      return json(res, 400, { error: "Invalid appointment payload" });
    }

    if (!termsAccepted) {
      return json(res, 400, { error: "Please accept Terms & Conditions to continue" });
    }

    const db = getFirebaseAdminDb();
    const timestamp = new Date().toISOString();
    const created = await db.collection("appointments").add({
      name,
      phone,
      date,
      doctor,
      doctorId,
      department,
      selectedDate,
      selectedTime,
      message,
      termsAccepted: true,
      bookingMode: "standard",
      verified: false,
      status: "pending",
      createdAt: timestamp,
      updatedAt: timestamp
    });

    await db.collection("notifications").add({
      title: "New appointment request",
      message: `${name} requested an appointment${doctor ? ` with ${doctor}` : ""}.`,
      type: "appointment",
      entityId: created.id,
      entityType: "appointment",
      read: false,
      createdAt: timestamp,
      updatedAt: timestamp
    });

    return json(res, 200, { id: created.id, ok: true });
  } catch (error) {
    console.error("Appointment API error:", error);
    return json(res, 500, { error: "Unable to save appointment" });
  }
}
