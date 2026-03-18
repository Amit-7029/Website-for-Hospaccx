import { blogPosts, facilities, testimonials, treatments, trustIndicators } from "../src/data/content.js";
import { departments, doctors } from "../src/data/doctors.js";

const HOSPITAL = {
  name: "Banerjee Diagnostic Foundation and Hospaccx",
  location: "Sainthia, Birbhum, West Bengal, India",
  phone: "+91 97320 29834",
  whatsapp: "https://wa.me/917384251751",
  map: "https://maps.app.goo.gl/vfxaeTEMkdFBnAsW8",
  emails: ["bdf.snt@gmail.com", "hospaccx.snt@gmail.com"],
  appointment:
    "Patients can book through the existing website appointment form and continue to WhatsApp for confirmation."
};

const LANGUAGE_LABELS = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali"
};

const EMERGENCY_MESSAGES = {
  hi: "Yeh emergency ho sakta hai. Turant hospital visit karein ya call karein.",
  bn: "\u098f\u099f\u09bf \u099c\u09b0\u09c1\u09b0\u09bf \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u0964 \u09a6\u09af\u09bc\u09be \u0995\u09b0\u09c7 \u09a6\u09cd\u09b0\u09c1\u09a4 \u09b9\u09be\u09b8\u09aa\u09be\u09a4\u09be\u09b2\u09c7 \u0986\u09b8\u09c1\u09a8 \u09ac\u09be \u09ab\u09cb\u09a8 \u0995\u09b0\u09c1\u09a8\u0964",
  en: "This may be an emergency. Please visit the hospital immediately or call."
};

const FALLBACK_GREETINGS = {
  hi: "Namaste! Main kaise madad kar sakta hoon?",
  bn: "\u09a8\u09ae\u09b8\u09cd\u0995\u09be\u09b0! \u0986\u09ae\u09bf \u0995\u09bf\u09ad\u09be\u09ac\u09c7 \u09b8\u09be\u09b9\u09be\u09af\u09cd\u09af \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf?",
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
  "\u099c\u09b0\u09c1\u09b0\u09bf",
  "\u09b6\u09cd\u09ac\u09be\u09b8",
  "\u09ac\u09cd\u09af\u09a5\u09be",
  "\u09b0\u0995\u09cd\u09a4",
  "\u092c\u0947\u0939\u094b\u0936",
  "\u0916\u0942\u0928",
  "\u0938\u093e\u0902\u0938",
  "\u0938\u0940\u0928\u0947 \u092e\u0947\u0902 \u0926\u0930\u094d\u0926",
  "\u0907\u092e\u0930\u091c\u0947\u0902\u0938\u0940"
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

function normalizeMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message) => message && typeof message.content === "string")
    .slice(-15);
}

function previousUserMessages(messages) {
  const normalized = normalizeMessages(messages).filter((message) => message.role === "user");
  return normalized.slice(0, -1).map((message) => message.content);
}

function findMatchingDepartment(text) {
  const normalized = normalize(text);
  return departments.find((department) => normalized.includes(department.toLowerCase())) || null;
}

function findDoctor(text) {
  const normalized = normalize(text);
  return doctors.find((doctor) => normalized.includes(doctor.name.toLowerCase())) || null;
}

function inferIntent(text) {
  const value = normalize(text);

  if (
    value.includes("appointment") ||
    value.includes("book") ||
    value.includes("booking") ||
    value.includes("consult") ||
    value.includes("\u0985\u09cd\u09af\u09be\u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f\u09ae\u09c7\u09a8\u09cd\u099f") ||
    value.includes("\u092c\u0941\u0915")
  ) {
    return "appointment";
  }

  if (
    value.includes("diagnostic") ||
    value.includes("service") ||
    value.includes("test") ||
    value.includes("scan") ||
    value.includes("pathology") ||
    value.includes("ecg") ||
    value.includes("echo") ||
    value.includes("x-ray") ||
    value.includes("usg") ||
    value.includes("ct") ||
    value.includes("\u09a1\u09be\u09af\u09bc\u09be\u0997\u09a8\u09b8\u09cd\u099f\u09bf\u0995") ||
    value.includes("\u09aa\u09b0\u09bf\u09b7\u09c7\u09ac\u09be") ||
    value.includes("\u09aa\u09b0\u09c0\u0995\u09cd\u09b7\u09be") ||
    value.includes("\u091f\u0947\u0938\u094d\u091f") ||
    value.includes("\u0921\u093e\u092f\u0917\u094d\u0928\u094b\u0938\u094d\u091f\u093f\u0915")
  ) {
    return "diagnostics";
  }

  if (
    value.includes("symptom") ||
    value.includes("pain") ||
    value.includes("fever") ||
    value.includes("sugar") ||
    value.includes("cough") ||
    value.includes("weakness") ||
    value.includes("bp") ||
    value.includes("breathing") ||
    value.includes("back pain") ||
    value.includes("joint") ||
    value.includes("\u09ac\u09cd\u09af\u09a5\u09be") ||
    value.includes("\u099c\u09cd\u09ac\u09b0") ||
    value.includes("\u0926\u0930\u094d\u0926") ||
    value.includes("\u092c\u0941\u0916\u093e\u0930")
  ) {
    return "symptoms";
  }

  if (
    value.includes("doctor") ||
    value.includes("specialist") ||
    value.includes("cardiology") ||
    value.includes("orthopedic") ||
    value.includes("medicine") ||
    value.includes("pediatric")
  ) {
    return "doctor";
  }

  return "general";
}

function isFollowUpQuestion(text) {
  const value = normalize(text).trim();
  return (
    value.length < 50 &&
    (
      value.includes("which") ||
      value.includes("what") ||
      value.includes("who") ||
      value.includes("can i") ||
      value.includes("should i") ||
      value.includes("department") ||
      value.includes("doctor") ||
      value.includes("timing") ||
      value.includes("book") ||
      value.includes("\u0995\u09cb\u09a8") ||
      value.includes("\u0995\u09bf") ||
      value.includes("\u0915\u094c\u0928") ||
      value.includes("\u0915\u094d\u092f\u093e")
    )
  );
}

function deriveContext(messages) {
  const latestUserMessage =
    [...normalizeMessages(messages)].reverse().find((message) => message.role === "user")?.content || "";
  const previousMessages = previousUserMessages(messages);
  const previousCombined = previousMessages.join(" ");
  const contextText = isFollowUpQuestion(latestUserMessage) ? `${previousCombined} ${latestUserMessage}`.trim() : latestUserMessage;

  return {
    latestUserMessage,
    contextText,
    latestIntent: inferIntent(latestUserMessage),
    contextIntent: inferIntent(contextText)
  };
}

function pickDepartmentFromSymptoms(text) {
  const value = normalize(text);
  if (value.includes("heart") || value.includes("chest pain") || value.includes("palpitation")) {
    return "CARDIOLOGY";
  }
  if (value.includes("child") || value.includes("baby") || value.includes("fever in child")) {
    return "PEDIATRIC";
  }
  if (value.includes("bone") || value.includes("joint") || value.includes("knee") || value.includes("back pain")) {
    return "ORTHOPEDIC";
  }
  if (value.includes("cough") || value.includes("breathing") || value.includes("asthma")) {
    return "CHEST SPECIALIST";
  }
  if (value.includes("sugar") || value.includes("bp") || value.includes("weakness") || value.includes("fever")) {
    return "GENERAL MEDICINE";
  }
  return null;
}

function fallbackResponse(messages, language) {
  const { latestUserMessage, contextText, latestIntent, contextIntent } = deriveContext(messages);
  const latestText = normalize(latestUserMessage);
  const matchedDoctor = findDoctor(latestUserMessage) || findDoctor(contextText);
  const matchedDepartment =
    findMatchingDepartment(latestUserMessage) ||
    findMatchingDepartment(contextText) ||
    pickDepartmentFromSymptoms(latestUserMessage) ||
    pickDepartmentFromSymptoms(contextText);

  if (matchedDoctor) {
    const base = `${matchedDoctor.name} (${matchedDoctor.department}) - ${matchedDoctor.qualification}. Timing: ${matchedDoctor.timing}. OPD Days: ${matchedDoctor.opdDays}.`;
    if (language === "hi") {
      return `${base} Aap website ke appointment form se is doctor ko select karke WhatsApp par request bhej sakte hain. Agar symptoms zyada hain to jaldi consultation book kariye.`;
    }
    if (language === "bn") {
      return `${base} \u0986\u09aa\u09a8\u09bf \u0993\u09af\u09bc\u09c7\u09ac\u09b8\u09be\u0987\u099f\u09c7\u09b0 appointment form \u09a6\u09bf\u09af\u09bc\u09c7 \u098f\u0987 \u09a1\u09be\u0995\u09cd\u09a4\u09be\u09b0\u0995\u09c7 select \u0995\u09b0\u09c7 WhatsApp-\u098f request \u09aa\u09be\u09a0\u09be\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u09a8\u0964 \u0989\u09aa\u09b8\u09b0\u09cd\u0997 \u09ac\u09c7\u09b6\u09bf \u09b9\u09b2\u09c7 \u09a4\u09be\u09a1\u09bc\u09be\u09a4\u09be\u09a1\u09bc\u09bf consultation \u09ac\u09c1\u0995 \u0995\u09b0\u09c1\u09a8\u0964`;
    }
    return `${base} You can select this doctor in the website appointment form and continue on WhatsApp to send your request. If the symptoms are troubling, it is best to book a consultation soon.`;
  }

  if (latestIntent === "appointment" || (isFollowUpQuestion(latestUserMessage) && contextIntent === "appointment")) {
    if (language === "hi") {
      return "Appointment ke liye form me naam, phone, department aur doctor select kijiye. Phir WhatsApp par continue karke request bhej dijiye. Zarurat ho to main relevant department bhi suggest kar sakta hoon.";
    }
    if (language === "bn") {
      return "\u0985\u09cd\u09af\u09be\u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f\u09ae\u09c7\u09a8\u09cd\u099f\u09c7\u09b0 \u099c\u09a8\u09cd\u09af form-\u098f \u09a8\u09be\u09ae, \u09ab\u09cb\u09a8, \u09ac\u09bf\u09ad\u09be\u0997 \u098f\u09ac\u0982 \u09a1\u09be\u0995\u09cd\u09a4\u09be\u09b0 select \u0995\u09b0\u09c1\u09a8\u0964 \u09a4\u09be\u09b0\u09aa\u09b0 WhatsApp-\u098f continue \u0995\u09b0\u09c7 request \u09aa\u09be\u09a0\u09be\u09a8\u0964 \u099a\u09be\u0987\u09b2\u09c7 \u0986\u09ae\u09bf relevant department-\u0993 suggest \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf\u0964";
    }
    return "To book an appointment, fill in your name, phone number, department, and doctor in the website form, then continue on WhatsApp to send the request. I can also help suggest the right department.";
  }

  if (latestIntent === "diagnostics" || (isFollowUpQuestion(latestUserMessage) && contextIntent === "diagnostics")) {
    if (language === "hi") {
      return "Yahan CT Scan, Digital X-Ray, ECG, ECHO, USG, pathology tests, uroflowmetry aur preventive check-ups available hain. Agar aap symptoms batayenge to main relevant doctor ya department suggest kar sakta hoon.";
    }
    if (language === "bn") {
      return "\u098f\u0996\u09be\u09a8\u09c7 CT Scan, Digital X-Ray, ECG, ECHO, USG, pathology test, uroflowmetry \u098f\u09ac\u0982 preventive check-up \u0995\u09b0\u09be \u09b9\u09af\u09bc\u0964 \u0986\u09aa\u09a8\u09bf \u0989\u09aa\u09b8\u09b0\u09cd\u0997 \u09ac\u09b2\u09b2\u09c7 \u0986\u09ae\u09bf relevant doctor \u09ac\u09be department suggest \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf\u0964";
    }
    return "The center provides CT Scan, Digital X-Ray, ECG, ECHO, USG, pathology tests, uroflowmetry, and preventive health check-ups. If you tell me the symptoms or concern, I can suggest the relevant doctor or department.";
  }

  if (matchedDepartment) {
    if (language === "hi") {
      return `${matchedDepartment} department relevant lag raha hai. Aap doctor list dekhkar appointment form se specialist select kar sakte hain. Zarurat ho to main next step bhi bata sakta hoon.`;
    }
    if (language === "bn") {
      return `${matchedDepartment} department \u0986\u09aa\u09a8\u09be\u09b0 \u099c\u09a8\u09cd\u09af relevant \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u0964 \u0986\u09aa\u09a8\u09bf doctor list \u09a6\u09c7\u0996\u09c7 appointment form \u09a5\u09c7\u0995\u09c7 specialist select \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u09a8\u0964 \u099a\u09be\u0987\u09b2\u09c7 \u0986\u09ae\u09bf next step-\u0993 \u09ac\u09b2\u09c7 \u09a6\u09bf\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf\u0964`;
    }
    return `${matchedDepartment} looks like the relevant department. You can check the doctor list and select the specialist from the appointment form. If you want, I can guide you with the next step as well.`;
  }

  if (latestIntent === "symptoms" || (isFollowUpQuestion(latestUserMessage) && contextIntent === "symptoms")) {
    if (language === "hi") {
      return "Main basic guidance de sakta hoon, lekin diagnosis ya dawa suggest nahi kar sakta. Aapke symptoms ke hisab se doctor consultation best rahega. Agar aap symptoms thoda aur clearly batayen, to main relevant department suggest kar dunga.";
    }
    if (language === "bn") {
      return "\u0986\u09ae\u09bf basic guidance \u09a6\u09bf\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf, \u0995\u09bf\u09a8\u09cd\u09a4\u09c1 diagnosis \u09ac\u09be medicine suggest \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf \u09a8\u09be\u0964 \u0986\u09aa\u09a8\u09be\u09b0 symptoms \u0985\u09a8\u09c1\u09af\u09be\u09af\u09bc\u09c0 doctor consultation \u09a8\u09c7\u0993\u09af\u09bc\u09be\u0987 best\u0964 \u0986\u09aa\u09a8\u09bf symptoms \u0986\u09b0\u0993 \u09ad\u09be\u09b2\u09ad\u09be\u09ac\u09c7 \u09ac\u09b2\u09b2\u09c7 \u0986\u09ae\u09bf relevant department suggest \u0995\u09b0\u09ac\u0964";
    }
    return "I can give basic guidance, but I cannot diagnose or suggest medicines. The safest next step is a doctor consultation. If you describe the symptoms a little more clearly, I can suggest the relevant department.";
  }

  if (language === "hi") {
    return `${FALLBACK_GREETINGS.hi} Aap doctors, diagnostics, emergency support, departments, ya appointment booking ke bare me pooch sakte hain.`;
  }
  if (language === "bn") {
    return `${FALLBACK_GREETINGS.bn} \u0986\u09aa\u09a8\u09bf doctors, diagnostics, emergency support, departments \u09ac\u09be appointment booking \u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995\u09c7 \u099c\u09be\u09a8\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u09a8\u0964`;
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

Behavior:
- Be warm, short, and patient-friendly.
- Use the recent conversation context.
- If a patient mentions symptoms, suggest a relevant department when possible.
- Encourage appointment booking when appropriate.
- Mention WhatsApp booking when it helps.

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
      temperature: 0.35,
      max_output_tokens: 320,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }]
        },
        ...normalizeMessages(messages).map((message) => ({
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
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const parsedBody =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {};
    const { messages = [], language = "en", requestedAt } = parsedBody;
    const safeLanguage = detectLanguage(language);
    const normalizedMessages = normalizeMessages(messages);
    const latestUserMessage =
      [...normalizedMessages].reverse().find((message) => message.role === "user")?.content || "";

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
      reply = await queryOpenAI(normalizedMessages, safeLanguage);
    } catch (error) {
      console.error("Chat AI fallback triggered:", error);
    }

    if (!reply) {
      reply = fallbackResponse(normalizedMessages, safeLanguage);
    }

    res.status(200).json({
      reply,
      language: safeLanguage,
      emergency: false,
      requestedAt: requestedAt || null
    });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({
      error: "Unable to process the chat request right now."
    });
  }
}
