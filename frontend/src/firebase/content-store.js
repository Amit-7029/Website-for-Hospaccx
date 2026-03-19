import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { contactDetails, diagnosticServices } from "../data/content";
import { getFirebaseServices, isFirebaseConfigured } from "./client";

const DEFAULT_CMS_CONTENT = {
  heroHeading: "Reliable healthcare and diagnostic services for Sainthia and Birbhum.",
  heroDescription:
    "For over 36 years, Banerjee Diagnostic Foundation and Hospaccx has been a trusted name in healthcare in Sainthia, Birbhum, delivering reliable diagnostics, expert medical services, and patient-centered care.",
  aboutHeading: "Committed to quality healthcare and accurate diagnostics.",
  aboutDescription:
    "Banerjee Diagnostic Foundation and Hospaccx is a modern multispecialty diagnostic and healthcare center dedicated to providing reliable medical services with accuracy, compassion, and professionalism.",
  whyChooseHeading: "Trusted by patients. Recommended by doctors.",
  missionHeading: "Delivering trusted healthcare with compassion.",
  missionDescription:
    "Our mission is to provide high-quality diagnostic and healthcare services that focus on accuracy, patient safety, and medical excellence.",
  visionHeading: "Building a healthier community.",
  visionDescription:
    "Our vision is to become one of the most trusted healthcare and diagnostic centers in Birbhum, known for medical reliability, modern technology, and compassionate patient care.",
  healthcareHeading: "Complete healthcare under one roof",
  servicesHeading: "Diagnostic & Laboratory Services",
  servicesNote:
    "Accurate laboratory support across essential diagnostic categories, presented in a clear and patient-friendly way.",
  reviewsHeading: "What our patients say",
  reviewsSubtitle: "Real experiences from our patients",
  appointmentHeading: "Book your appointment with ease",
  appointmentDescription:
    "Taking care of your health should be simple and convenient. Schedule your consultation with our experienced doctors and continue directly to WhatsApp for a fast confirmation request with our clinic team.",
  contactHeading: "Get in touch with us",
  contactDescription:
    "If you have any health concerns or need diagnostic services, feel free to contact us. Our dedicated team is always ready to support you with trusted healthcare and reliable diagnostic services.",
  contactPhone: "+91 97320 29834",
  contactEmail: "hospaccx.snt@gmail.com",
  contactAddress: contactDetails.address,
  emergencyText:
    "For urgent care situations, connect immediately with the hospital team for emergency, ICU, and diagnostic support."
};

function normalizeService(service, index = 0) {
  const title = String(service.title || "").trim();
  const words = title.split(/\s+/).filter(Boolean);
  const fallbackIcon = words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || `S${index + 1}`;

  return {
    id: service.id ?? `service-${index + 1}`,
    title,
    description: String(service.description || "").trim(),
    icon: String(service.icon || fallbackIcon).trim(),
    category: String(service.category || "Laboratory").trim()
  };
}

export async function loadCmsContent() {
  if (!isFirebaseConfigured()) {
    return {
      content: DEFAULT_CMS_CONTENT,
      source: "local"
    };
  }

  const { firestore } = getFirebaseServices();
  if (!firestore) {
    return {
      content: DEFAULT_CMS_CONTENT,
      source: "local"
    };
  }

  const snapshot = await getDoc(doc(firestore, "cms", "website"));
  if (!snapshot.exists()) {
    return {
      content: DEFAULT_CMS_CONTENT,
      source: "local"
    };
  }

  return {
    content: {
      ...DEFAULT_CMS_CONTENT,
      ...snapshot.data()
    },
    source: "firestore"
  };
}

export async function loadDiagnosticServices() {
  if (!isFirebaseConfigured()) {
    return {
      services: diagnosticServices.map(normalizeService),
      source: "local"
    };
  }

  const { firestore } = getFirebaseServices();
  if (!firestore) {
    return {
      services: diagnosticServices.map(normalizeService),
      source: "local"
    };
  }

  const snapshot = await getDocs(query(collection(firestore, "services"), orderBy("title")));
  const remoteServices = snapshot.docs.map((entry, index) => normalizeService({ id: entry.id, ...entry.data() }, index));

  return {
    services: remoteServices.length ? remoteServices : diagnosticServices.map(normalizeService),
    source: remoteServices.length ? "firestore" : "local"
  };
}

export { DEFAULT_CMS_CONTENT };
