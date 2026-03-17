import { blogPosts, facilities, testimonials, treatments, trustIndicators } from "../src/data/content.js";
import { departments, doctors } from "../src/data/doctors.js";

const HOSPITAL = {
  name: "Banerjee Diagnostic Foundation and Hospaccx",
  location: "Sainthia, Birbhum, West Bengal, India",
  phone: "+91 97320 29834",
  whatsapp: "https://wa.me/917384251751",
  map: "https://maps.app.goo.gl/vfxaeTEMkdFBnAsW8",
  emails: ["bdf.snt@gmail.com", "hospaccx.snt@gmail.com"],
  appointment: "Patients can book through the existing website appointment form and continue to WhatsApp for confirmation."
};

const LANGUAGE_LABELS = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali"
};

const EMERGENCY_MESSAGES = {
  hi: "Yeh emergency ho sakta hai. Turant hospital visit karein ya call karein.",
  bn: "এটি জরুরি হতে পারে। দয়া করে দ্রুত হাসপাতালে আসুন বা ফোন করুন।",
  en: "This may be an emergency. Please visit the hospital immediately or call."
};

const FALLBACK_GREETINGS = {
  hi: "Namaste! Main kaise madad kar sakta hoon?",
  bn: "নমস্কার! আমি কিভাবে সাহায্য করতে পারি?",
  en: "Hello! How can I help you?"
};

const URGENT_KEYWORDS = [
  "emergency",
  "urgent",
  "ambulance",
  "accident",
  "unconscious",
  "bleeding",
  "breathing",
  "breathless",
  "chest pain",
  "stroke",
  "fits",
  "severe",
  "critical",
  "জরুরি",
  "শ্বাস",
  "ব্যথা",
  "রক্ত",
  "बेहोश",
  "खून",
  "सांस",
  "सीने में दर्द",
  "इमरजेंसी"
];

function buildKnowledgeBase() {
  const serviceList = [
    "CT Scan",
    "Digital X-Ray",
    "ECG",
    "ECHO",
    "USG",
    "Pathology Laboratory Tests",
    "Uroflowmetry",
    "Preventive Health Check-ups",
    "ICU Care",
    "Emergency Services",
    "Pharmacy Support"
  ];

  const doctorSummaries = doctors
    .map((doctor) => `${doctor.name} | ${doctor.department} | ${doctor.qualification} | Timing: ${doctor.timing} | OPD: ${doctor.opdDays}`)
    .join("\n");

  const treatmentSummaries = treatments
    .map(
      (treatment) =>
        `${treatment.title}: Symptoms - ${treatment.symptoms.join(", ")}. Causes - ${treatment.causes.join(", ")}. Treatment support - ${treatment.treatmentOptions.join(", ")}.`
    )
    .join("\n");

  return `
Hospital: ${HOSPITAL.name}
Location: ${HOSPITAL.location}
Contact phone: ${HOSPITAL.phone}
Emails: ${HOSPITAL.emails.join(", ")}
Map: ${HOSPITAL.map}
Appointment process: ${HOSPITAL.appointment}
Departments: ${departments.join(", ")}
Services: ${serviceList.join(", ")}
Facilities:
${facilities.map((item) => `- ${item.title}: ${item.description}`).join("\n")}
Trust indicators:
${trustIndicators.map((item) => `- ${item.value} ${item.label}`).join("\n")}
Treatment pages:
${treatmentSummaries}
Blog topics:
${blogPosts.map((post) => `- ${post.title}: ${post.excerpt}`).join("\n")}
Testimonials:
${testimonials.map((item) => `- ${item.name}: ${item.feedback}`).join("\n")}
Doctors:
${doctorSummaries}
  `.trim();
}

const KNOWLEDGE_BASE = buildKnowledgeBase();

function detectLanguage(language) {
  if (["hi", "bn", "en"].includes(language)) {
    return language;
  }
  return "en";
}

function normalize(text) {
  return String(text || "").toLowerCase();
}

function isEmergency(text) {
  const value = normalize(text);
  return URGENT_KEYWORDS.some((keyword) => value.includes(keyword));
}

function findMatchingDepartment(text) {
  const normalized = normalize(text);
  return departments.find((department) => normalized.includes(department.toLowerCase())) || null;
}

function findDoctor(text) {
  const normalized = normalize(text);
  return doctors.find((doctor) => normalized.includes(doctor.name.toLowerCase())) || null;
}

function fallbackResponse(message, language) {
  const text = normalize(message);
  const matchedDoctor = findDoctor(message);
  const matchedDepartment = findMatchingDepartment(message);

  if (matchedDoctor) {
    const base = `${matchedDoctor.name} (${matchedDoctor.department}) - ${matchedDoctor.qualification}. Timing: ${matchedDoctor.timing}. OPD Days: ${matchedDoctor.opdDays}.`;
    if (language === "hi") {
      return `${base} Appointment ke liye website form use karke WhatsApp par continue kariye. Agar symptoms serious hain to doctor consultation zaroor lijiye.`;
    }
    if (language === "bn") {
      return `${base} অ্যাপয়েন্টমেন্টের জন্য ওয়েবসাইটের ফর্ম ব্যবহার করে WhatsApp-এ এগিয়ে যান। উপসর্গ গুরুতর হলে অবশ্যই ডাক্তারের পরামর্শ নিন।`;
    }
    return `${base} Use the website appointment form and continue on WhatsApp to request a booking. Please consult a doctor for proper evaluation.`;
  }

  if (text.includes("appointment") || text.includes("book") || text.includes("অ্যাপয়েন্টমেন্ট") || text.includes("बुक")) {
    if (language === "hi") {
      return "Appointment ke liye form me naam, phone, department aur doctor select kijiye. Uske baad WhatsApp par continue karke request bhej sakte hain.";
    }
    if (language === "bn") {
      return "অ্যাপয়েন্টমেন্টের জন্য ফর্মে নাম, ফোন, বিভাগ এবং ডাক্তার নির্বাচন করুন। তারপর WhatsApp-এ গিয়ে অনুরোধ পাঠাতে পারবেন।";
    }
    return "To book an appointment, use the form on the website, select the department and doctor, then continue on WhatsApp for confirmation.";
  }

  if (
    text.includes("diagnostic") ||
    text.includes("ডায়াগনস্টিক") ||
    text.includes("পরিষেবা") ||
    text.includes("service") ||
    text.includes("সার্ভিস") ||
    text.includes("ডায়াগনস্টিক সার্ভিস") ||
    text.includes("test") ||
    text.includes("scan") ||
    text.includes("pathology") ||
    text.includes("রিপোর্ট") ||
    text.includes("পরীক্ষা") ||
    text.includes("टेस्ट") ||
    text.includes("डायग्नोस्टिक")
  ) {
    if (language === "hi") {
      return "Hum CT Scan, Digital X-Ray, ECG, ECHO, USG, pathology tests aur preventive check-ups provide karte hain. Sahi test ke liye doctor consultation helpful rahega.";
    }
    if (language === "bn") {
      return "আমাদের এখানে CT Scan, Digital X-Ray, ECG, ECHO, USG, pathology test এবং preventive check-up করা হয়। সঠিক পরীক্ষা নির্ধারণে ডাক্তারের পরামর্শ নেওয়া ভাল।";
    }
    return "The center provides CT Scan, Digital X-Ray, ECG, ECHO, USG, pathology tests, uroflowmetry, and preventive health check-ups. A doctor consultation can help choose the right test.";
  }

  if (matchedDepartment) {
    if (language === "hi") {
      return `${matchedDepartment} department available hai. Doctor list dekhkar appointment form se specialist select kijiye. Main chahein to aapko booking ki taraf guide kar sakta hoon.`;
    }
    if (language === "bn") {
      return `${matchedDepartment} বিভাগ উপলব্ধ আছে। ডাক্তার তালিকা দেখে ফর্মের মাধ্যমে বিশেষজ্ঞ নির্বাচন করতে পারবেন। চাইলে আমি আপনাকে বুকিং-এর দিকে গাইড করতে পারি।`;
    }
    return `${matchedDepartment} is available. You can review the doctor list and select the specialist from the appointment form. I can also guide you toward booking.`;
  }

  if (
    text.includes("symptom") ||
    text.includes("pain") ||
    text.includes("fever") ||
    text.includes("sugar") ||
    text.includes("cough") ||
    text.includes("ব্যথা") ||
    text.includes("জ্বর") ||
    text.includes("दर्द") ||
    text.includes("बुखार")
  ) {
    if (language === "hi") {
      return "Main basic guidance de sakta hoon, lekin diagnosis ya dawa suggest nahi kar sakta. Symptoms ke hisab se General Medicine, Cardiology, Orthopedic, Pediatric ya Chest Specialist relevant ho sakta hai. Best rahega ki doctor consultation book karein.";
    }
    if (language === "bn") {
      return "আমি সাধারণ দিকনির্দেশ দিতে পারি, কিন্তু রোগ নির্ণয় বা ওষুধ বলতে পারি না। উপসর্গ অনুযায়ী General Medicine, Cardiology, Orthopedic, Pediatric বা Chest Specialist উপযুক্ত হতে পারে। ডাক্তারের অ্যাপয়েন্টমেন্ট নেওয়াই ভাল।";
    }
    return "I can offer basic guidance, but I cannot diagnose or suggest medicines. Depending on the symptoms, General Medicine, Cardiology, Orthopedic, Pediatric, or Chest Specialist care may be relevant. The safest next step is to book a doctor consultation.";
  }

  if (language === "hi") {
    return `${FALLBACK_GREETINGS.hi} Aap services, doctors, diagnostics, emergency support, ya appointment booking ke bare me pooch sakte hain.`;
  }
  if (language === "bn") {
    return `${FALLBACK_GREETINGS.bn} আপনি services, doctors, diagnostics, emergency support বা appointment booking সম্পর্কে জানতে পারেন।`;
  }
  return `${FALLBACK_GREETINGS.en} You can ask about doctors, diagnostics, emergency support, departments, or appointment booking.`;
}

async function queryOpenAI(messages, language) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const systemPrompt = `
You are Hospaccx Assistant for ${HOSPITAL.name} in ${HOSPITAL.location}.

Answer in ${LANGUAGE_LABELS[language]} only.
Tone:
- English: simple conversational English
- Hindi: simple Hinglish
- Bengali: natural easy Bengali

Safety:
- Do not prescribe medicines.
- Do not provide prescriptions.
- Do not diagnose serious diseases.
- Do not claim certainty.
- Always encourage doctor consultation for symptoms.
- For emergency symptoms, tell the patient to visit the hospital immediately or call.

Use only the grounded hospital knowledge below. If a detail is not in the knowledge, say you can help them contact the hospital or use WhatsApp booking.

Hospital knowledge:
${KNOWLEDGE_BASE}
  `.trim();

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_output_tokens: 280,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }]
        },
        ...messages.map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: [{ type: "input_text", text: String(message.content || "") }]
        }))
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.output_text?.trim() || null;
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const parsedBody =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
    const { messages = [], language = "en" } = parsedBody;
    const safeLanguage = detectLanguage(language);
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "";

    if (isEmergency(latestUserMessage)) {
      res.status(200).json({
        reply: EMERGENCY_MESSAGES[safeLanguage],
        language: safeLanguage,
        emergency: true
      });
      return;
    }

    let reply = null;

    try {
      reply = await queryOpenAI(messages, safeLanguage);
    } catch (error) {
      console.error("Chat AI fallback triggered:", error);
    }

    if (!reply) {
      reply = fallbackResponse(latestUserMessage, safeLanguage);
    }

    res.status(200).json({
      reply,
      language: safeLanguage,
      emergency: false
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: "Unable to process the chat request right now."
    });
  }
}
