import { createOtpRequest, json, sanitizeAppointmentPayload, validateControlledBookingRequest } from "../_appointment-booking.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { doctorId, selectedDate, phone, name } = sanitizeAppointmentPayload(payload);

    if (!doctorId || !selectedDate || phone.length < 10 || name.length < 2) {
      return json(res, 400, { error: "Incomplete OTP request" });
    }

    const validation = await validateControlledBookingRequest({ doctorId, selectedDate, phone, name });
    if (validation.availability.otpRequired && !validation.availability.otpConfigured) {
      return json(res, 503, {
        error: "OTP service is not configured yet. Please disable OTP for this doctor in admin or contact reception.",
      });
    }

    if (!validation.availability.otpRequired) {
      return json(res, 200, {
        ok: true,
        skipped: true,
        requestId: null,
        expiresAt: null,
      });
    }

    const otpRequest = await createOtpRequest({ doctorId, selectedDate, phone, name });
    return json(res, 200, {
      ok: true,
      ...otpRequest,
    });
  } catch (error) {
    console.error("Send OTP API error:", error);
    return json(res, 400, { error: error instanceof Error ? error.message : "Unable to send OTP" });
  }
}
