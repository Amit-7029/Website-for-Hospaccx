import { getFirebaseAdminDb } from "../_firebase-admin.js";

const DEFAULT_HERO_CONTENT = {
  heading: "Advanced Diagnostic Services in Sainthia",
  subheading: "Accurate Reports • Experienced Doctors • Trusted Care",
  primaryButtonText: "Book Appointment",
  secondaryButtonText: "Call Now",
  primaryButtonLink: "#appointment",
  secondaryButtonLink: "tel:+919732029834",
  imageUrl: "/images/hospital-front.jpg",
  backgroundImageUrl: "/images/dignostic center front in day.jpg",
  overlayOpacity: 0.56,
  overlayColor: "#0f172a"
};

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    const db = getFirebaseAdminDb();
    const snapshot = await db.collection("content").doc("hero").get();
    const heroContent = snapshot.exists ? snapshot.data() : null;

    return json(res, 200, {
      ...DEFAULT_HERO_CONTENT,
      ...(heroContent || {})
    });
  } catch (error) {
    console.error("Hero content API error:", error);
    return json(res, 200, DEFAULT_HERO_CONTENT);
  }
}
