import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { diagnosticServices } from "../data/content";
import cmsDefaults from "../data/cms-defaults.json";
import { getFirebaseServices, isFirebaseConfigured } from "./client";
import { getRuntimePerformanceProfile, readCachedResource, writeCachedResource } from "../utils/runtime-performance";

const DEFAULT_CMS_CONTENT = cmsDefaults;
const CMS_CACHE_KEY = "cms-content";
const HERO_CACHE_KEY = "hero-content";
const SERVICES_CACHE_KEY = "services-content";
const CACHE_MAX_AGE_MS = 1000 * 60 * 20;
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
  const cached = readCachedResource(CMS_CACHE_KEY, CACHE_MAX_AGE_MS);
  if (!isFirebaseConfigured()) {
    const localResult = {
      content: DEFAULT_CMS_CONTENT,
      source: "local"
    };
    writeCachedResource(CMS_CACHE_KEY, localResult);
    return localResult;
  }

  const { firestore } = getFirebaseServices();
  if (!firestore) {
    const localResult = {
      content: DEFAULT_CMS_CONTENT,
      source: "local"
    };
    writeCachedResource(CMS_CACHE_KEY, localResult);
    return localResult;
  }
  try {
    const snapshot = await getDoc(doc(firestore, "cms", "website"));
    if (!snapshot.exists()) {
      const localResult = {
        content: DEFAULT_CMS_CONTENT,
        source: "local"
      };
      writeCachedResource(CMS_CACHE_KEY, localResult);
      return localResult;
    }

    const result = {
      content: {
        ...DEFAULT_CMS_CONTENT,
        ...snapshot.data()
      },
      source: "firestore"
    };
    writeCachedResource(CMS_CACHE_KEY, result);
    return result;
  } catch (error) {
    console.warn("Unable to load CMS content from Firestore, using cached/local content.", error);
    if (cached?.data) {
      return cached.data;
    }

    const localResult = {
      content: DEFAULT_CMS_CONTENT,
      source: "local"
    };
    writeCachedResource(CMS_CACHE_KEY, localResult);
    return localResult;
  }
}

export async function loadHeroContent() {
  const cached = readCachedResource(HERO_CACHE_KEY, CACHE_MAX_AGE_MS);
  const runtime = getRuntimePerformanceProfile();

  if (typeof fetch === "function") {
    try {
      const response = await fetch(`/api/content/hero${runtime.lowDataMode ? "" : `?t=${Date.now()}`}`, {
        cache: runtime.lowDataMode ? "force-cache" : "no-store"
      });

      if (response.ok) {
        const payload = await response.json();
        const result = {
          content: {
            ...DEFAULT_HERO_CONTENT,
            ...payload
          },
          source: "firestore"
        };
        writeCachedResource(HERO_CACHE_KEY, result);
        return result;
      }
    } catch (error) {
      console.warn("Unable to load hero content through API, falling back to SDK/local content.", error);
      if (cached?.data) {
        return cached.data;
      }
    }
  }

  if (!isFirebaseConfigured()) {
    const localResult = {
      content: DEFAULT_HERO_CONTENT,
      source: "local"
    };
    writeCachedResource(HERO_CACHE_KEY, localResult);
    return localResult;
  }

  const { firestore } = getFirebaseServices();
  if (!firestore) {
    const localResult = {
      content: DEFAULT_HERO_CONTENT,
      source: "local"
    };
    writeCachedResource(HERO_CACHE_KEY, localResult);
    return localResult;
  }

  const snapshot = await getDoc(doc(firestore, "content", "hero"));
  if (!snapshot.exists()) {
    const localResult = {
      content: DEFAULT_HERO_CONTENT,
      source: "local"
    };
    writeCachedResource(HERO_CACHE_KEY, localResult);
    return localResult;
  }

  const result = {
    content: {
      ...DEFAULT_HERO_CONTENT,
      ...snapshot.data()
    },
    source: "firestore"
  };
  writeCachedResource(HERO_CACHE_KEY, result);
  return result;
}

export async function loadDiagnosticServices() {
  const cached = readCachedResource(SERVICES_CACHE_KEY, CACHE_MAX_AGE_MS);

  if (!isFirebaseConfigured()) {
    const localResult = {
      services: diagnosticServices.map(normalizeService),
      source: "local"
    };
    writeCachedResource(SERVICES_CACHE_KEY, localResult);
    return localResult;
  }

  const { firestore } = getFirebaseServices();
  if (!firestore) {
    const localResult = {
      services: diagnosticServices.map(normalizeService),
      source: "local"
    };
    writeCachedResource(SERVICES_CACHE_KEY, localResult);
    return localResult;
  }

  const snapshot = await getDocs(query(collection(firestore, "services"), orderBy("title")));
  const remoteServices = snapshot.docs.map((entry, index) => normalizeService({ id: entry.id, ...entry.data() }, index));

  const result = {
    services: remoteServices.length ? remoteServices : diagnosticServices.map(normalizeService),
    source: remoteServices.length ? "firestore" : "local"
  };
  writeCachedResource(SERVICES_CACHE_KEY, result);
  return result;
}

export { DEFAULT_CMS_CONTENT, DEFAULT_HERO_CONTENT };
