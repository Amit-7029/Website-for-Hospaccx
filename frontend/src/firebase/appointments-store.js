import { addDoc, collection } from "firebase/firestore";
import { getFirebaseServices, isFirebaseConfigured } from "./client";

const COLLECTION_NAME = "appointments";

function appointmentsCollection() {
  const { firestore } = getFirebaseServices();
  return firestore ? collection(firestore, COLLECTION_NAME) : null;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || "Request failed");
  }

  return payload;
}

export async function createAppointment(payload) {
  try {
    const result = await requestJson("/api/appointments", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    return {
      id: result.id ?? `api-${Date.now()}`,
      ...payload
    };
  } catch (error) {
    console.error("Appointment API request failed:", error);
    if (isFirebaseConfigured()) {
      throw error;
    }
  }

  if (!isFirebaseConfigured()) {
    return {
      id: `local-${Date.now()}`,
      ...payload
    };
  }

  const collectionRef = appointmentsCollection();
  if (!collectionRef) {
    throw new Error("Firebase Firestore is not configured.");
  }

  const created = await addDoc(collectionRef, payload);
  return {
    id: created.id,
    ...payload
  };
}

export async function fetchControlledBookingAvailability(doctorId) {
  return requestJson(`/api/appointments/availability?doctorId=${encodeURIComponent(doctorId)}`);
}

export async function sendAppointmentOtp(payload) {
  return requestJson("/api/appointments/send-otp", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function verifyAppointmentOtp(payload) {
  return requestJson("/api/appointments/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function confirmControlledAppointment(payload) {
  return requestJson("/api/appointments/confirm", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
