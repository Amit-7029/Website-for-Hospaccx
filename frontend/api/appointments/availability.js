import { getControlledAvailability, json } from "../_appointment-booking.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const doctorId = String(req.query?.doctorId || "").trim();
    if (!doctorId) {
      return json(res, 400, { error: "Doctor is required" });
    }

    const availability = await getControlledAvailability(doctorId);
    return json(res, 200, availability);
  } catch (error) {
    console.error("Availability API error:", error);
    return json(res, 500, { error: error instanceof Error ? error.message : "Unable to load booking availability" });
  }
}
