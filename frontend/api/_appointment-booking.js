import crypto from "node:crypto";
import { doctors as fallbackDoctors, normalizeDoctor } from "../src/data/doctors.js";
import { getFirebaseAdminDb } from "./_firebase-admin.js";

const CLINIC_WHATSAPP_NUMBER = "917384251751";
const OTP_COLLECTION = "otp_collection";

function cleanText(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim();
}

function asBoolean(value) {
  return value === true || value === "true" || value === "on" || value === 1 || value === "1";
}

export function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

export function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  return digits.length > 10 ? digits.slice(-10) : digits;
}

function appointmentSecret() {
  return process.env.SESSION_SECRET || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "hospaccx-appointments";
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(`${otp}:${appointmentSecret()}`).digest("hex");
}

function formatLabelFromDate(dateValue) {
  const parsed = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function loadDoctorsData() {
  try {
    const db = getFirebaseAdminDb();
    const snapshot = await db.collection("doctors").get();
    const remoteDoctors = snapshot.docs.map((entry) => normalizeDoctor({ id: entry.id, ...entry.data() }));

    return remoteDoctors.length ? remoteDoctors : fallbackDoctors;
  } catch (error) {
    console.error("Unable to load doctors from Firestore for booking APIs. Falling back to bundled doctors.", error);
    return fallbackDoctors;
  }
}

export async function loadDoctorById(doctorId) {
  const doctors = await loadDoctorsData();
  return doctors.find((entry) => entry.id === doctorId) || null;
}

export async function getControlledAvailability(doctorId) {
  const db = getFirebaseAdminDb();
  const doctor = await loadDoctorById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const bookingSettings = doctor.bookingSettings ?? { enabled: false, bookingOpen: true, otpRequired: false, dates: [] };
  if (!bookingSettings.enabled) {
    return {
      doctor,
      controlled: false,
      bookingOpen: true,
      otpRequired: false,
      otpConfigured: hasSmsOtpProvider(),
      dates: [],
    };
  }

  const appointmentsSnapshot = await db.collection("appointments").where("doctorId", "==", doctorId).get();
  const bookedByDate = appointmentsSnapshot.docs.reduce((accumulator, entry) => {
    const data = entry.data();
    const selectedDate = cleanText(data.selectedDate || "");
    if (!selectedDate) {
      return accumulator;
    }

    accumulator[selectedDate] = (accumulator[selectedDate] || 0) + 1;
    return accumulator;
  }, {});
  const bookedSlotsByDate = appointmentsSnapshot.docs.reduce((accumulator, entry) => {
    const data = entry.data();
    const selectedDate = cleanText(data.selectedDate || "");
    const selectedTime = cleanText(data.selectedTime || "");
    if (!selectedDate || !selectedTime) {
      return accumulator;
    }

    accumulator[selectedDate] = accumulator[selectedDate] || [];
    if (!accumulator[selectedDate].includes(selectedTime)) {
      accumulator[selectedDate].push(selectedTime);
    }
    return accumulator;
  }, {});

  const dates = (bookingSettings.dates || [])
    .map((entry) => {
      const dateValue = cleanText(entry?.date);
      const limit = Number(entry?.limit || 0);
      if (!dateValue || limit <= 0) {
        return null;
      }

      const booked = bookedByDate[dateValue] || 0;
      const slotsLeft = Math.max(0, limit - booked);

      return {
        date: dateValue,
        label: formatLabelFromDate(dateValue),
        limit,
        booked,
        slotsLeft,
        isFull: slotsLeft <= 0,
        bookedSlots: bookedSlotsByDate[dateValue] || [],
        timeSlots: Array.isArray(entry?.timeSlots)
          ? entry.timeSlots.map((slot) => cleanText(slot)).filter(Boolean)
          : [],
      };
    })
    .filter(Boolean);

  return {
    doctor,
    controlled: true,
    bookingOpen: bookingSettings.bookingOpen !== false,
    otpRequired: bookingSettings.otpRequired !== false,
    otpConfigured: hasSmsOtpProvider(),
    dates,
  };
}

async function getDuplicateAppointments({ doctorId, phone }) {
  const db = getFirebaseAdminDb();
  const normalizedPhone = normalizePhone(phone);
  const snapshot = await db.collection("appointments").where("doctorId", "==", doctorId).get();
  return snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .filter((entry) => normalizePhone(entry.phone) === normalizedPhone);
}

export async function validateControlledBookingRequest({ doctorId, name, phone, selectedDate, selectedTime = "" }) {
  const availability = await getControlledAvailability(doctorId);
  if (!availability.controlled) {
    throw new Error("This doctor is not configured for controlled booking");
  }

  if (!availability.bookingOpen) {
    throw new Error("Booking is currently closed for this doctor");
  }

  const selectedSlot = availability.dates.find((entry) => entry.date === selectedDate);
  if (!selectedSlot) {
    throw new Error("Selected date is not available for booking");
  }

  if (selectedSlot.isFull) {
    throw new Error("No slots available for this date");
  }

  if (
    selectedTime &&
    Array.isArray(selectedSlot.bookedSlots) &&
    selectedSlot.bookedSlots.includes(cleanText(selectedTime))
  ) {
    throw new Error("This slot has already been booked");
  }

  const duplicates = await getDuplicateAppointments({ doctorId, phone });
  const normalizedName = cleanText(name).toLowerCase();

  if (duplicates.some((entry) => cleanText(entry.name).toLowerCase() === normalizedName)) {
    throw new Error("Already booked with this name and mobile number");
  }

  if (duplicates.length) {
    throw new Error("This mobile number already has a booking");
  }

  return {
    availability,
    selectedSlot,
  };
}

function buildOtpDocId({ doctorId, selectedDate, phone }) {
  return [doctorId, selectedDate, normalizePhone(phone)].join("__");
}

function getExpiryTimestamp(minutes = 5) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function basicAuthHeader(accountSid, authToken) {
  return `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`;
}

export function hasSmsOtpProvider() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SMS_FROM);
}

export function hasWhatsAppProvider() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM);
}

async function sendOtpSms(phone, otp) {
  if (!hasSmsOtpProvider()) {
    throw new Error("OTP provider not configured");
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_SMS_FROM;
  const body = `Your Hospaccx booking OTP is ${otp}. It expires in 5 minutes.`;
  const payload = new URLSearchParams({
    To: `+91${normalizePhone(phone)}`,
    From: from,
    Body: body,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(accountSid, authToken),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(`OTP delivery failed: ${errorPayload}`);
  }
}

export async function createOtpRequest({ doctorId, selectedDate, phone, name }) {
  const db = getFirebaseAdminDb();
  const docId = buildOtpDocId({ doctorId, selectedDate, phone });
  const otpRef = db.collection(OTP_COLLECTION).doc(docId);
  const existing = await otpRef.get();
  const current = existing.exists ? existing.data() : null;
  const currentExpired = current?.expiryTime ? new Date(current.expiryTime).getTime() < Date.now() : true;
  const requestCount = currentExpired ? 0 : Number(current?.requestCount || 0);

  if (requestCount >= 3) {
    throw new Error("OTP request limit reached for this mobile number");
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await sendOtpSms(phone, otp);

  const timestamp = new Date().toISOString();
  await otpRef.set(
    {
      phone: normalizePhone(phone),
      name: cleanText(name),
      doctorId,
      selectedDate,
      otpHash: hashOtp(otp),
      expiryTime: getExpiryTimestamp(5),
      requestCount: requestCount + 1,
      attempts: 0,
      verified: false,
      consumed: false,
      createdAt: current?.createdAt || timestamp,
      updatedAt: timestamp,
    },
    { merge: true },
  );

  return {
    requestId: docId,
    expiresAt: getExpiryTimestamp(5),
  };
}

export async function verifyOtpRequest({ requestId, otp, phone }) {
  const db = getFirebaseAdminDb();
  const otpRef = db.collection(OTP_COLLECTION).doc(requestId);
  const snapshot = await otpRef.get();

  if (!snapshot.exists) {
    throw new Error("OTP request not found");
  }

  const data = snapshot.data();
  if (normalizePhone(data.phone) !== normalizePhone(phone)) {
    throw new Error("OTP request does not match this mobile number");
  }

  if (data.consumed) {
    throw new Error("This OTP has already been used");
  }

  if (new Date(data.expiryTime).getTime() < Date.now()) {
    throw new Error("OTP expired");
  }

  if (data.verified) {
    return {
      requestId,
      verified: true,
      selectedDate: data.selectedDate,
      doctorId: data.doctorId,
    };
  }

  const nextAttempts = Number(data.attempts || 0) + 1;
  if (nextAttempts > 5) {
    throw new Error("Too many invalid OTP attempts");
  }

  const otpMatches = hashOtp(cleanText(otp)) === data.otpHash;
  await otpRef.set(
    {
      attempts: nextAttempts,
      verified: otpMatches,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  if (!otpMatches) {
    throw new Error("Invalid OTP");
  }

  return {
    requestId,
    verified: true,
    selectedDate: data.selectedDate,
    doctorId: data.doctorId,
  };
}

export async function consumeVerifiedOtp({ requestId, phone, doctorId, selectedDate }) {
  const db = getFirebaseAdminDb();
  const otpRef = db.collection(OTP_COLLECTION).doc(requestId);
  const snapshot = await otpRef.get();

  if (!snapshot.exists) {
    throw new Error("OTP verification record not found");
  }

  const data = snapshot.data();
  if (!data.verified) {
    throw new Error("OTP verification incomplete");
  }

  if (data.consumed) {
    throw new Error("OTP already used");
  }

  if (new Date(data.expiryTime).getTime() < Date.now()) {
    throw new Error("OTP expired");
  }

  if (normalizePhone(data.phone) !== normalizePhone(phone) || data.doctorId !== doctorId || data.selectedDate !== selectedDate) {
    throw new Error("OTP verification does not match this booking");
  }

  await otpRef.set(
    {
      consumed: true,
      consumedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

function buildClinicWhatsappUrl({ name, phone, doctorName, selectedDate, selectedTime }) {
  const message = [
    "Hello, a controlled booking has been completed.",
    "",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Doctor: ${doctorName}`,
    `Date: ${selectedDate}`,
    `Time: ${selectedTime || "By appointment"}`,
  ].join("\n");

  return `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

async function sendWhatsAppConfirmation(phone, body) {
  if (!hasWhatsAppProvider()) {
    return false;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const payload = new URLSearchParams({
    To: `whatsapp:+91${normalizePhone(phone)}`,
    From: `whatsapp:${from}`,
    Body: body,
  });

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(accountSid, authToken),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });

  return response.ok;
}

export async function createControlledAppointment({ name, phone, doctorId, selectedDate, selectedTime, message }) {
  const db = getFirebaseAdminDb();
  const { availability, selectedSlot } = await validateControlledBookingRequest({
    doctorId,
    name,
    phone,
    selectedDate,
    selectedTime,
  });

  const doctor = availability.doctor;
  const timestamp = new Date().toISOString();
  const appointmentDate = selectedTime
    ? new Date(`${selectedDate}T09:00:00`)
    : new Date(`${selectedDate}T00:00:00`);

  if (selectedTime) {
    const timeMatch = cleanText(selectedTime).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (timeMatch) {
      let hours = Number(timeMatch[1]) % 12;
      if (timeMatch[3].toUpperCase() === "PM") {
        hours += 12;
      }
      appointmentDate.setHours(hours, Number(timeMatch[2]), 0, 0);
    }
  }

  const created = await db.collection("appointments").add({
    name: cleanText(name),
    phone: normalizePhone(phone),
    doctor: doctor.name,
    doctorId: doctor.id,
    department: doctor.department,
    selectedDate,
    selectedTime: cleanText(selectedTime),
    date: appointmentDate.toISOString(),
    message: cleanText(message),
    termsAccepted: true,
    verified: true,
    bookingMode: "controlled",
    status: "confirmed",
    createdAt: timestamp,
    updatedAt: timestamp,
    slotLimit: selectedSlot.limit,
  });

  await db.collection("notifications").add({
    title: "OTP verified booking confirmed",
    message: `${cleanText(name)} booked ${doctor.name} for ${selectedDate}.`,
    type: "appointment",
    entityId: created.id,
    entityType: "appointment",
    read: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const whatsappBody = `Hello ${cleanText(name)},\nYour appointment with ${doctor.name} is confirmed.\n\nDate: ${selectedSlot.label}\nHospital: Banerjee Diagnostic Foundation\n\nPlease arrive on time.`;
  const whatsappSent = await sendWhatsAppConfirmation(phone, whatsappBody).catch((error) => {
    console.error("Unable to send WhatsApp confirmation:", error);
    return false;
  });

  return {
    id: created.id,
    whatsappSent,
    clinicWhatsappUrl: buildClinicWhatsappUrl({
      name,
      phone,
      doctorName: doctor.name,
      selectedDate: selectedSlot.label,
      selectedTime,
    }),
  };
}

export function sanitizeAppointmentPayload(payload) {
  return {
    name: cleanText(payload?.name),
    phone: normalizePhone(payload?.phone),
    doctorId: cleanText(payload?.doctorId),
    selectedDate: cleanText(payload?.selectedDate),
    selectedTime: cleanText(payload?.selectedTime),
    message: cleanText(payload?.message),
    requestId: cleanText(payload?.requestId),
    otp: cleanText(payload?.otp),
    termsAccepted: asBoolean(payload?.termsAccepted),
  };
}
