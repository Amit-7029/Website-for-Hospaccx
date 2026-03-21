import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { diagnosticServices } from "../data/content";
import cmsDefaults from "../data/cms-defaults.json";
import { getFirebaseServices, isFirebaseConfigured } from "./client";

const DEFAULT_CMS_CONTENT = cmsDefaults;
const DEFAULT_HERO_CONTENT = {
  heading: "Advanced Diagnostic Services in Sainthia",
  subheading: "Accurate Reports • Experienced Doctors • Trusted Care",
  primaryButtonText: "Book Appointment",
  secondaryButtonText: "Call Now",
  primaryButtonLink: "#appointment",
  secondaryButtonLink: "tel:+919732029834",
  visualBadgeText: "LARGEST NABL LAB IN BIRBHUM",
  imageUrl: "/images/hospital-front.jpg",
  backgroundImageUrl: "/images/dignostic center front in day.jpg",
  overlayOpacity: 0.56,
  overlayColor: "#0f172a"
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

export async function loadHeroContent() {
  if (typeof fetch === "function") {
    try {
      const response = await fetch(`/api/content/hero?t=${Date.now()}`, {
        cache: "no-store"
      });

      if (response.ok) {
        const payload = await response.json();
        return {
          content: {
            ...DEFAULT_HERO_CONTENT,
            ...payload
          },
          source: "firestore"
        };
      }
    } catch (error) {
      console.warn("Unable to load hero content through API, falling back to SDK/local content.", error);
    }
  }

  if (!isFirebaseConfigured()) {
    return {
      content: DEFAULT_HERO_CONTENT,
      source: "local"
    };
  }

  const { firestore } = getFirebaseServices();
  if (!firestore) {
    return {
      content: DEFAULT_HERO_CONTENT,
      source: "local"
    };
  }

  const snapshot = await getDoc(doc(firestore, "content", "hero"));
  if (!snapshot.exists()) {
    return {
      content: DEFAULT_HERO_CONTENT,
      source: "local"
    };
  }

  return {
    content: {
      ...DEFAULT_HERO_CONTENT,
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

export { DEFAULT_CMS_CONTENT, DEFAULT_HERO_CONTENT };
