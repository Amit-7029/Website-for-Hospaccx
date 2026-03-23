import { json, sanitizeAppointmentPayload, verifyOtpRequest } from "../_appointment-booking.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { requestId, otp, phone } = sanitizeAppointmentPayload(payload);

    if (!requestId || !otp || phone.length < 10) {
      return json(res, 400, { error: "Incomplete OTP verification request" });
    }

    const verified = await verifyOtpRequest({ requestId, otp, phone });
    return json(res, 200, {
      ok: true,
      ...verified,
    });
  } catch (error) {
    console.error("Verify OTP API error:", error);
    return json(res, 400, { error: error instanceof Error ? error.message : "Unable to verify OTP" });
  }
}
