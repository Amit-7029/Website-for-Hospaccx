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

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizeName(value) {
  return sanitizeText(value)
    .toLowerCase()
    .replace(/\s+/g, " ");
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
    const dateOfBirth = sanitizeText(payload?.dateOfBirth);
    const phone = normalizePhone(payload?.phone);
    const date = sanitizeText(payload?.date);
    const doctor = sanitizeText(payload?.doctor);
    const doctorId = sanitizeText(payload?.doctorId);
    const department = sanitizeText(payload?.department);
    const selectedDate = sanitizeText(payload?.selectedDate);
    const selectedTime = sanitizeText(payload?.selectedTime);
    const message = sanitizeText(payload?.message);
    const termsAccepted = isTermsAccepted(payload?.termsAccepted);

    if (!name || !dateOfBirth || !phone || !date || !doctor || !department || !selectedDate || !selectedTime) {
      return json(res, 400, { error: "Please fill all required fields." });
    }

    if (name.length < 2) {
      return json(res, 400, { error: "Please enter the patient's full name." });
    }

    if (dateOfBirth.length < 8) {
      return json(res, 400, { error: "Please select a valid date of birth." });
    }

    if (phone.length !== 10) {
      return json(res, 400, { error: "Please enter a valid 10-digit mobile number." });
    }

    if (date.length < 10) {
      return json(res, 400, { error: "Please select a valid appointment date and time." });
    }

    if (!termsAccepted) {
      return json(res, 400, { error: "Please accept Terms & Conditions to continue" });
    }

    const db = getFirebaseAdminDb();
    const existingAppointments = await db.collection("appointments").get();
    const normalizedName = normalizeName(name);
    const duplicatePhone = existingAppointments.docs.some((entry) => normalizePhone(entry.data()?.phone) === phone);
    if (duplicatePhone) {
      return json(res, 409, { error: "This mobile number already has an appointment." });
    }

    const duplicateNameDob = existingAppointments.docs.some((entry) => {
      const data = entry.data();
      return normalizeName(data?.name) === normalizedName && sanitizeText(data?.dateOfBirth) === dateOfBirth;
    });
    if (duplicateNameDob) {
      return json(res, 409, { error: "An appointment already exists with this name and date of birth." });
    }

    const timestamp = new Date().toISOString();
    const created = await db.collection("appointments").add({
      name,
      dateOfBirth,
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
