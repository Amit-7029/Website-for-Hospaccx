import {
  consumeVerifiedOtp,
  createControlledAppointment,
  getControlledAvailability,
  json,
  sanitizeAppointmentPayload,
} from "../_appointment-booking.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { doctorId, selectedDate, selectedTime, phone, name, dateOfBirth, message, requestId, termsAccepted } = sanitizeAppointmentPayload(payload);

    if (!doctorId || !selectedDate || phone.length < 10 || name.length < 2 || dateOfBirth.length < 8) {
      return json(res, 400, { error: "Incomplete booking request" });
    }

    if (!termsAccepted) {
      return json(res, 400, { error: "Please accept Terms & Conditions to continue" });
    }

    if (requestId) {
      const availability = await getControlledAvailability(doctorId);
      if (availability.otpRequired) {
      await consumeVerifiedOtp({
        requestId,
        phone,
        doctorId,
        selectedDate,
      });
      }
    }

    const created = await createControlledAppointment({
      name,
      dateOfBirth,
      phone,
      doctorId,
      selectedDate,
      selectedTime,
      message,
    });

    return json(res, 200, {
      ok: true,
      ...created,
    });
  } catch (error) {
    console.error("Confirm appointment API error:", error);
    return json(res, 400, { error: error instanceof Error ? error.message : "Unable to confirm booking" });
  }
}
