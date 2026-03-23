import "./styles.css";
import { blogPosts, diagnosticServices, facilities, testimonials, treatments } from "./data/content";
import { doctors as fallbackDoctors } from "./data/doctors";
import { MEDIA_IMAGE_FALLBACK, fallbackMediaItems } from "./data/media";
import {
  confirmControlledAppointment,
  createAppointment,
  fetchControlledBookingAvailability
} from "./firebase/appointments-store";
import { loadDoctors } from "./firebase/doctors-store";
import { DEFAULT_CMS_CONTENT, DEFAULT_HERO_CONTENT, loadCmsContent, loadDiagnosticServices, loadHeroContent } from "./firebase/content-store";
import { loadMediaItems } from "./firebase/media-store";
import { createReview, loadReviews } from "./firebase/reviews-store";
import { closeAnimatedLayer, createMotionSystem, openAnimatedLayer } from "./motion";

const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY"
];

const state = {
  doctors: [],
  departments: [],
  selectedDepartment: "",
  doctorsSource: "local",
  cmsSource: "local",
  servicesSource: "local",
  heroSource: "local",
  cmsContent: null,
  heroContent: DEFAULT_HERO_CONTENT,
  services: diagnosticServices,
  mediaItems: fallbackMediaItems,
  mediaSource: "local",
  reviews: [],
  reviewsSource: "local",
  visibleReviewCount: 6,
  activeHeroSlide: 0,
  appointmentBooking: {
    activeDoctorId: "",
    controlled: false,
    bookingOpen: true,
    otpRequired: false,
    otpConfigured: false,
    dates: [],
    otpRequestId: "",
    otpVerified: false,
    otpExpiresAt: "",
    otpTimerId: null,
    requestToken: 0
  }
};

let motion = {
  refresh() {},
  disconnect() {}
};
let heroAutoplayTimer = 0;
const HERO_SLIDE_DURATION_MS = 3000;

function createMediaQueryList(query, matchesFallback = false) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return {
      matches: matchesFallback,
      addEventListener: null,
      removeEventListener: null,
      addListener: null,
      removeListener: null
    };
  }

  return window.matchMedia(query);
}

function bindMediaQueryChange(mediaQuery, handler) {
  if (!mediaQuery || !handler) {
    return () => {};
  }

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener?.("change", handler);
  }

  if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener?.(handler);
  }

  return () => {};
}

function getScrollOffset() {
  const topbar = document.querySelector(".topbar");
  const nav = document.querySelector(".nav");
  const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
  const navHeight = nav ? nav.getBoundingClientRect().height : 0;
  return topbarHeight + Math.min(navHeight, 110) + 16;
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (!section) {
    return;
  }

  const targetTop = window.scrollY + section.getBoundingClientRect().top - getScrollOffset();
  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "smooth"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function updateTextContent(selector, value) {
  if (value === undefined || value === null) {
    return;
  }

  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function updateLink(selector, { href, text }) {
  document.querySelectorAll(selector).forEach((element) => {
    if (href) {
      element.setAttribute("href", href);
    }

    if (text && element.childElementCount === 0) {
      element.textContent = text;
    }
  });
}

function ensureMetaTag(selector, attributes) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value));
    document.head.appendChild(tag);
  }
  return tag;
}

function applySeoMeta(content) {
  if (!content) {
    return;
  }

  if (content.seoTitle) {
    document.title = content.seoTitle;
  }

  if (content.seoDescription) {
    ensureMetaTag('meta[name="description"]', { name: "description" }).setAttribute("content", content.seoDescription);
    ensureMetaTag('meta[property="og:description"]', { property: "og:description" }).setAttribute("content", content.seoDescription);
  }

  if (content.seoKeywords) {
    ensureMetaTag('meta[name="keywords"]', { name: "keywords" }).setAttribute("content", content.seoKeywords);
  }

  if (content.seoTitle) {
    ensureMetaTag('meta[property="og:title"]', { property: "og:title" }).setAttribute("content", content.seoTitle);
  }

  if (content.seoOgImageUrl) {
    ensureMetaTag('meta[property="og:image"]', { property: "og:image" }).setAttribute("content", content.seoOgImageUrl);
  }
}

function cmsValue(key, fallback = "") {
  if (!key) {
    return fallback;
  }

  return state.cmsContent?.[key] ?? DEFAULT_CMS_CONTENT[key] ?? fallback;
}

function heroValue(key, fallback = "") {
  if (!key) {
    return fallback;
  }

  return state.heroContent?.[key] ?? DEFAULT_HERO_CONTENT[key] ?? fallback;
}

function setHeroBackgroundStyles() {
  const hero = document.querySelector(".hero");
  if (!hero) {
    return;
  }

  const backgroundImageUrl = heroValue("backgroundImageUrl", DEFAULT_HERO_CONTENT.backgroundImageUrl);
  const overlayColor = heroValue("overlayColor", DEFAULT_HERO_CONTENT.overlayColor);
  const overlayOpacityValue = Number(heroValue("overlayOpacity", DEFAULT_HERO_CONTENT.overlayOpacity));
  const overlayOpacity = Number.isFinite(overlayOpacityValue)
    ? Math.min(0.7, Math.max(0.3, overlayOpacityValue))
    : DEFAULT_HERO_CONTENT.overlayOpacity;

  hero.style.setProperty("--hero-background-image", `url("${backgroundImageUrl}")`);
  hero.style.setProperty("--hero-overlay-color", overlayColor);
  hero.style.setProperty("--hero-overlay-opacity", String(overlayOpacity));
}

function applyHeroContent() {
  updateTextContent("#heroHeading", heroValue("heading", DEFAULT_HERO_CONTENT.heading));
  updateTextContent("#heroSubheading", heroValue("subheading", DEFAULT_HERO_CONTENT.subheading));
  updateTextContent("#heroVisualBadge", heroValue("visualBadgeText", DEFAULT_HERO_CONTENT.visualBadgeText));
  updateLink("#heroPrimaryButton", {
    href: heroValue("primaryButtonLink", DEFAULT_HERO_CONTENT.primaryButtonLink),
    text: heroValue("primaryButtonText", DEFAULT_HERO_CONTENT.primaryButtonText)
  });
  updateLink("#heroSecondaryButton", {
    href: heroValue("secondaryButtonLink", DEFAULT_HERO_CONTENT.secondaryButtonLink),
    text: heroValue("secondaryButtonText", DEFAULT_HERO_CONTENT.secondaryButtonText)
  });
  setHeroBackgroundStyles();
}

function applyCmsContent() {
  const content = {
    ...DEFAULT_CMS_CONTENT,
    ...(state.cmsContent || {})
  };
  if (!content) {
    return;
  }

  applySeoMeta(content);

  document.querySelectorAll("[data-cms]").forEach((element) => {
    const key = element.getAttribute("data-cms");
    if (!key || content[key] === undefined) {
      return;
    }
    element.textContent = content[key];
  });

  document.querySelectorAll("[data-cms-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-cms-placeholder");
    if (!key || content[key] === undefined) {
      return;
    }
    element.setAttribute("placeholder", content[key]);
  });

  document.querySelectorAll("[data-cms-src]").forEach((element) => {
    const key = element.getAttribute("data-cms-src");
    if (!key || !content[key]) {
      return;
    }

    if (element.tagName === "IFRAME") {
      element.setAttribute("src", content[key]);
      return;
    }

    if ("src" in element) {
      element.setAttribute("src", content[key]);
    }
  });

  updateTextContent("#heroHeading", content.heroHeading);
  updateTextContent("#heroDescription", content.heroDescription);
  updateTextContent("#aboutHeading", content.aboutHeading);
  updateTextContent("#aboutDescription", content.aboutDescription);
  updateTextContent("#whyChooseHeading", content.whyChooseHeading);
  updateTextContent("#missionHeading", content.missionHeading);
  updateTextContent("#missionDescription", content.missionDescription);
  updateTextContent("#visionHeading", content.visionHeading);
  updateTextContent("#visionDescription", content.visionDescription);
  updateTextContent("#healthcareHeading", content.healthcareHeading);
  updateTextContent("#servicesHeading", content.servicesHeading);
  updateTextContent("#servicesNote", content.servicesNote);
  updateTextContent("#reviewsHeading", content.reviewsHeading);
  updateTextContent("#reviewsSubtitle", content.reviewsSubtitle);
  updateTextContent("#appointmentHeading", content.appointmentHeading);
  updateTextContent("#appointmentDescription", content.appointmentDescription);
  updateTextContent("#contactHeading", content.contactHeading);
  updateTextContent("#contactDescription", content.contactDescription);
  updateTextContent("#emergencyText", content.emergencyText);
  updateTextContent("[data-main-contact-phone]", content.contactPhone);
  updateTextContent("[data-main-contact-email]", content.contactEmail);
  updateTextContent("[data-main-contact-address]", content.contactAddress);
  updateLink("[data-map-link]", { href: content.topbarMapUrl });
  updateLink("[data-instagram-link]", { href: content.instagramUrl });
  updateLink("[data-facebook-link]", { href: content.facebookUrl });
  updateLink("[data-whatsapp-link]", { href: content.whatsappGroupUrl });
  updateLink("[data-secondary-email-link]", {
    href: `mailto:${content.secondaryEmail}`,
    text: content.secondaryEmail
  });
  updateLink("[data-main-phone-link]", { href: `tel:${content.contactPhone.replace(/[^\d+]/g, "")}` });
  updateLink("[data-main-email-link]", { href: `mailto:${content.contactEmail}`, text: content.contactEmail });
}

function formatAvailability(availability = []) {
  return availability
    .map((slot) => `${slot.day}: ${slot.from}`)
    .join(" | ");
}

function deriveDepartments(doctors) {
  return [...new Set(doctors.map((doctor) => String(doctor.department || "").trim()).filter(Boolean))];
}

function renderStarString(rating) {
  const normalized = Math.max(1, Math.min(5, Number(rating) || 0));
  return `${"&#9733;".repeat(normalized)}${"&#9734;".repeat(5 - normalized)}`;
}

async function selectAppointmentDoctorById(doctorId) {
  const doctor = state.doctors.find((entry) => entry.id === doctorId);
  const departmentSelect = document.getElementById("department");
  const doctorSelect = document.getElementById("doctor");

  if (!doctor || !departmentSelect || !doctorSelect) {
    return;
  }

  departmentSelect.value = doctor.department;
  populateDoctorSelect(doctor.department, doctor.name);
  await applySelectedDoctor(doctor);
  scrollToSection("appointment");
}

function doctorAvatar(doctor) {
  return doctor.image || (doctor.gender === "female" ? "/images/doctor-female.jpeg" : "/images/doctor-male.jpeg");
}

function doctorGalleryImage(doctor) {
  return doctor.posterImage || doctorAvatar(doctor);
}

function getMediaItemsBySection(section, category = "") {
  return state.mediaItems.filter((item) => {
    if (item.section !== section) {
      return false;
    }

    return category ? item.category === category : true;
  });
}

function getSectionMediaItem(section, order) {
  return getMediaItemsBySection(section).find((item) => Number(item.order) === Number(order)) ?? null;
}

function renderSectionMediaCards(containerId, section, cards, cardClassName = "section-media-card") {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  container.innerHTML = cards
    .map((card, index) => {
      const media = getSectionMediaItem(section, index + 1);
      const motionVariant = index % 2 === 0 ? "slideLeft" : "slideRight";

      return `
        <article class="${cardClassName}" data-motion="${motionVariant}" style="--motion-delay:${index * 90}ms">
          ${
            media
              ? `
                <div class="section-media-card__image-wrap">
                  ${imageMarkup(media.imageUrl, media.alt || media.title || card.title, "section-media-card__image")}
                  <span class="section-media-card__badge">${escapeHtml(media.category || card.badge || "")}</span>
                </div>
              `
              : ""
          }
          <div class="section-media-card__content">
            ${card.badge ? `<p class="section-media-card__eyebrow">${escapeHtml(card.badge)}</p>` : ""}
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.text)}</p>
          </div>
        </article>
      `;
    })
    .join("");

  motion.refresh();
}

function imageMarkup(src, alt, className, eager = false) {
  return `<img src="${escapeHtml(src || MEDIA_IMAGE_FALLBACK)}" alt="${escapeHtml(alt || "Hospaccx media")}" class="${className}" loading="${eager ? "eager" : "lazy"}" onerror="this.onerror=null;this.src='${MEDIA_IMAGE_FALLBACK}'">`;
}

function clearHeroAutoplay() {
  if (heroAutoplayTimer) {
    window.clearInterval(heroAutoplayTimer);
    heroAutoplayTimer = 0;
  }
}

function scheduleHeroAutoplay(slideCount) {
  clearHeroAutoplay();

  if (slideCount <= 1) {
    return;
  }

  heroAutoplayTimer = window.setInterval(() => {
    state.activeHeroSlide = (state.activeHeroSlide + 1) % slideCount;
    renderHeroMedia(false);
  }, HERO_SLIDE_DURATION_MS);
}

const departmentDescriptions = {
  CARDIOLOGY: "Heart care consultations with specialist support for chest discomfort, blood pressure, and cardiac follow-up.",
  "CHEST SPECIALIST": "Respiratory evaluation and chest care support for cough, breathing concerns, and lung-related conditions.",
  "DENTAL SURGEON": "Comprehensive dental consultation for oral health, tooth care, extractions, and routine dental procedures.",
  "DERMATOLOGIST, SEXOLOGIST": "Expert skin and wellness consultation for dermatological concerns, infections, and personal health guidance.",
  "E.N.T": "Specialist care for ear, nose, and throat concerns with focused evaluation and treatment planning.",
  "EYE SPECIALIST (SURGEON)": "Eye consultation and vision care support for routine ophthalmic evaluation and surgical guidance when needed.",
  GASTROENTEROLOGY: "Digestive health consultation for stomach, liver, bowel, and gastrointestinal concerns with specialist evaluation.",
  "GENERAL MEDICINE": "Primary physician consultation for fever, weakness, infection, chronic illness management, and general medical care.",
  "GENERAL SURGEON": "Surgical consultation for abdominal, soft tissue, and general operative concerns with structured follow-up support.",
  GYNECOLOGY: "Dedicated women’s health consultation for gynecological care, pregnancy guidance, fertility concerns, and hormonal support.",
  MEDICINE: "Specialist internal medicine consultation for adult health conditions, diagnosis planning, and ongoing medical monitoring.",
  NEUROLOGIST: "Neurology consultation for headache, nerve-related issues, stroke follow-up, seizures, and neurological assessment.",
  ORTHOPEDIC: "Bone, joint, spine, and fracture care consultation for pain relief, mobility concerns, and orthopedic treatment planning.",
  PEDIATRICS: "Child health consultation with caring support for growth, fever, infections, and routine pediatric follow-up.",
  PATHOLOGY: "Reliable pathology and laboratory testing support for accurate reporting, screening, and diagnostic guidance.",
  PSYCHIATRY: "Confidential mental health consultation for emotional well-being, stress support, and psychiatric evaluation.",
  RADIOLOGY: "Diagnostic imaging support with accurate reporting for scans, X-ray, ultrasound, and radiology-based assessment.",
  UROLOGIST: "Urology consultation for urinary, kidney, prostate, and male health concerns with specialist evaluation.",
  ONCOLOGY: "Specialist oncology guidance for cancer screening, diagnostic review, and ongoing treatment coordination.",
  NEPHROLOGY: "Kidney care consultation for renal health, swelling, blood pressure concerns, and long-term monitoring."
};

function getDepartmentDescription(department) {
  const normalized = String(department || "").trim().toUpperCase();
  if (departmentDescriptions[normalized]) {
    return departmentDescriptions[normalized];
  }

  const readableDepartment = String(department || "this department").trim();
  return `${readableDepartment} consultation services are available with professional OPD support, clinical guidance, and coordinated patient care.`;
}

function renderDepartments() {
  const container = document.getElementById("departmentGrid");
  const section = document.getElementById("departments");
  if (!container) {
    return;
  }

  if (section) {
    section.hidden = state.departments.length === 0;
  }

  if (!state.departments.length) {
    container.innerHTML = "";
    motion.refresh();
    return;
  }

  container.innerHTML = state.departments
    .map(
      (department, index) => `
        <article class="department-card">
          <span class="department-card__index">${String(index + 1).padStart(2, "0")}</span>
          <h3>${escapeHtml(department)}</h3>
          <p>${escapeHtml(getDepartmentDescription(department))}</p>
        </article>
      `
    )
    .join("");

  motion.refresh();
}

function renderHeroMedia(resetAutoplay = true) {
  const slider = document.getElementById("heroMediaSlider");
  const dots = document.getElementById("heroMediaDots");
  const visualSlider = document.getElementById("heroVisualSlider");
  const visualDots = document.getElementById("heroVisualDots");
  const mediaSlides = getMediaItemsBySection("hero");
  const fallbackBackgroundSlide = {
    id: "hero-background-fallback",
    title: "Hero background",
    alt: "Banerjee Diagnostic Foundation and Hospaccx hero background",
    imageUrl: heroValue("backgroundImageUrl", DEFAULT_HERO_CONTENT.backgroundImageUrl)
  };
  const fallbackVisualSlide = {
    id: "hero-visual-fallback",
    title: "Hero hospital image",
    alt: "Banerjee Diagnostic Foundation and Hospaccx hospital image",
    imageUrl: heroValue("imageUrl", DEFAULT_HERO_CONTENT.imageUrl)
  };
  const backgroundSlides = mediaSlides.length ? mediaSlides : [fallbackBackgroundSlide];
  const visualSlides = mediaSlides.length ? mediaSlides : [fallbackVisualSlide];

  if (!slider || !visualSlider) {
    return;
  }

  if (!backgroundSlides.length || !visualSlides.length) {
    slider.innerHTML = "";
    visualSlider.innerHTML = "";
    if (dots) {
      dots.innerHTML = "";
    }
    if (visualDots) {
      visualDots.innerHTML = "";
    }
    clearHeroAutoplay();
    return;
  }

  const maxSlides = Math.max(backgroundSlides.length, visualSlides.length);
  const safeIndex = Math.min(state.activeHeroSlide, maxSlides - 1);
  state.activeHeroSlide = Math.max(0, safeIndex);
  const activeBackgroundIndex = state.activeHeroSlide % backgroundSlides.length;
  const activeVisualIndex = state.activeHeroSlide % visualSlides.length;

  slider.innerHTML = backgroundSlides
    .map(
      (item, index) => `
        <article class="hero-slide${index === activeBackgroundIndex ? " is-active" : ""}">
          ${imageMarkup(item.imageUrl, item.alt || item.title, "hero-slide__image", index === 0)}
          <div class="hero-slide__overlay"></div>
        </article>
      `
    )
    .join("");

  visualSlider.innerHTML = visualSlides
    .map(
      (item, index) => `
        <article class="hero-visual-slide${index === activeVisualIndex ? " is-active" : ""}">
          ${imageMarkup(item.imageUrl, item.alt || item.title, "hero__visual-image", index === 0)}
        </article>
      `
    )
    .join("");

  if (dots && maxSlides > 1) {
    dots.innerHTML = backgroundSlides
      .map(
        (item, index) => `
          <button
            type="button"
            class="hero-media-dot${index === activeBackgroundIndex ? " is-active" : ""}"
            aria-label="${escapeHtml(item.title || `Hero slide ${index + 1}`)}"
            data-hero-slide="${index}"></button>
        `
      )
      .join("");
  } else if (dots) {
    dots.innerHTML = "";
  }

  if (visualDots && maxSlides > 1) {
    visualDots.innerHTML = visualSlides
      .map(
        (item, index) => `
          <button
            type="button"
            class="hero-media-dot${index === activeVisualIndex ? " is-active" : ""}"
            aria-label="${escapeHtml(item.title || `Hero image ${index + 1}`)}"
            data-hero-visual-slide="${index}"></button>
        `
      )
      .join("");
  } else if (visualDots) {
    visualDots.innerHTML = "";
  }

  document.querySelectorAll("[data-hero-slide], [data-hero-visual-slide]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeHeroSlide = Number(button.dataset.heroSlide || button.dataset.heroVisualSlide || 0);
      renderHeroMedia(true);
    });
  });

  if (resetAutoplay) {
    scheduleHeroAutoplay(maxSlides);
  }
  motion.refresh();
}

function renderMediaHighlights() {
  const container = document.getElementById("mediaShowcaseGrid");
  if (!container) {
    return;
  }

  const highlightItems = getMediaItemsBySection("highlights");
  container.innerHTML = highlightItems
    .map(
      (item, index) => `
        <article class="media-feature-card" data-motion="${index % 2 === 0 ? "slideLeft" : "slideRight"}" style="--motion-delay:${index * 80}ms">
          <div class="media-feature-card__image-wrap">
            ${imageMarkup(item.imageUrl, item.alt || item.title, "media-feature-card__image")}
          </div>
          <div class="media-feature-card__body">
            <p class="eyebrow">${escapeHtml(item.category)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.caption)}</p>
          </div>
        </article>
      `
    )
    .join("");

  motion.refresh();
}

function renderWhyChooseMedia() {
  renderSectionMediaCards("whyChooseGrid", "whyChoose", [
    {
      badge: cmsValue("whyChooseEyebrow", "Why Choose Us"),
      title: cmsValue("whyChooseCardOneTitle", "Medical Excellence"),
      text: cmsValue("whyChooseCardOneText", "Advanced diagnostic equipment, reliable reports, and experienced specialist doctors.")
    },
    {
      badge: cmsValue("whyChooseEyebrow", "Why Choose Us"),
      title: cmsValue("whyChooseCardTwoTitle", "Patient-Centered Care"),
      text: cmsValue("whyChooseCardTwoText", "Hygienic, patient-friendly environment supported by efficient and professional staff.")
    },
    {
      badge: cmsValue("whyChooseEyebrow", "Why Choose Us"),
      title: cmsValue("whyChooseCardThreeTitle", "Community Trust"),
      text: cmsValue("whyChooseCardThreeText", "Affordable and accessible healthcare services focused on trust, compassion, and accuracy.")
    }
  ], "testimonial-card testimonial-card--media");
}

function renderHealthcareMedia() {
  const description = document.getElementById("healthcareFeatureDescription");

  if (description) {
    description.textContent = cmsValue(
      "healthcareFeatureDescription",
      "Integrated diagnostics, emergency support, specialist access, and patient assistance organized through one premium care system."
    );
  }

  renderSectionMediaCards("healthcareGrid", "healthcare", [
    {
      badge: cmsValue("healthcareEyebrow", "Complete Healthcare"),
      title: cmsValue("healthcareCardOneTitle", "Integrated Care"),
      text: cmsValue("healthcareCardOneText", "Diagnostic, ICU support, specialist doctors, and pharmacy access organized through one healthcare system.")
    },
    {
      badge: cmsValue("healthcareEyebrow", "Complete Healthcare"),
      title: cmsValue("healthcareCardTwoTitle", "Emergency & ICU"),
      text: cmsValue("healthcareCardTwoText", "24x7 emergency and ICU facility with advanced critical care support available whenever patients need it most.")
    },
    {
      badge: cmsValue("healthcareEyebrow", "Complete Healthcare"),
      title: cmsValue("healthcareCardThreeTitle", "Cashless Support"),
      text: cmsValue("healthcareCardThreeText", "Swasthya Sathi Card accepted with cashless treatment support available for eligible patients.")
    }
  ], "testimonial-card testimonial-card--media");
}

function renderPharmacyMedia() {
  renderSectionMediaCards("pharmacyGrid", "pharmacies", [
    {
      badge: cmsValue("pharmaciesEyebrow", "Our Pharmacies"),
      title: cmsValue("pharmacyCardOneTitle", "Vivekananda Ausadhalaya"),
      text: cmsValue("pharmacyCardOneText", "Trusted pharmacy support connected with your healthcare services for accessible medicine availability.")
    },
    {
      badge: cmsValue("pharmaciesEyebrow", "Our Pharmacies"),
      title: cmsValue("pharmacyCardTwoTitle", "Hospaccx Medicine"),
      text: cmsValue("pharmacyCardTwoText", "Dedicated pharmacy support designed to improve convenience, continuity of care, and patient access to medicines.")
    },
    {
      badge: cmsValue("pharmaciesEyebrow", "Our Pharmacies"),
      title: cmsValue("pharmacyCardThreeTitle", "Patient-Focused Assistance"),
      text: cmsValue("pharmacyCardThreeText", "Pharmacy guidance aligned with diagnosis, consultation, and treatment pathways for a smoother patient experience.")
    }
  ], "service-card service-card--media");
}

function renderGallery() {
  const container = document.getElementById("galleryGrid");
  if (!container) {
    return;
  }

  const items = getMediaItemsBySection("gallery").slice(0, 6);
  container.innerHTML = items
    .map(
      (item, index) => `
        <figure class="gallery-card${item.large ? " gallery-card--large" : ""}">
          <button class="gallery-card__button" type="button" data-src="${escapeHtml(item.imageUrl)}" data-alt="${escapeHtml(item.alt || item.title)}">
            ${imageMarkup(item.imageUrl, item.alt || item.title, "gallery-card__image")}
          </button>
          <figcaption>
            <span>${escapeHtml(item.caption)}</span>
            ${item.ctaLink ? `<a class="gallery-card__link" href="${item.ctaLink}" target="${item.ctaLink.startsWith("#") ? "_self" : "_blank"}" rel="noreferrer">${escapeHtml(item.ctaLabel || "Open image")}</a>` : ""}
          </figcaption>
        </figure>
      `
    )
    .join("");

  container.querySelectorAll("[data-src]").forEach((button) => {
    button.addEventListener("click", () => openGalleryLightbox(button.dataset.src, button.dataset.alt));
  });

  motion.refresh();
}

function renderTrustIndicators() {
  const container = document.getElementById("trustGrid");
  if (!container) {
    return;
  }

  const indicatorItems = [
    {
      value: cmsValue("statsOneValue", "36+"),
      label: cmsValue("statsOneLabel", "Years of healthcare service"),
      progress: cmsValue("statsOneProgress", "96")
    },
    {
      value: cmsValue("statsTwoValue", "10000+"),
      label: cmsValue("statsTwoLabel", "Patients supported"),
      progress: cmsValue("statsTwoProgress", "98")
    },
    {
      value: cmsValue("statsThreeValue", "30+"),
      label: cmsValue("statsThreeLabel", "Specialist consultants"),
      progress: cmsValue("statsThreeProgress", "94")
    },
    {
      value: cmsValue("statsFourValue", "24x7"),
      label: cmsValue("statsFourLabel", "Emergency availability"),
      progress: cmsValue("statsFourProgress", "100")
    }
  ];

  container.innerHTML = indicatorItems
    .map(
      (item) => `
        <article class="stats-card" data-motion="fadeUp">
          <div class="stats-card__ring" style="--stats-progress:${Math.min(100, Math.max(0, Number(item.progress) || 0))}">
            <div class="stats-card__ring-inner">
              <strong>${escapeHtml(item.value)}</strong>
            </div>
          </div>
          <span>${escapeHtml(item.label)}</span>
        </article>
      `
    )
    .join("");

  motion.refresh();
}

function renderFloatingInfoCard() {
  const container = document.getElementById("floatingInfoCardGrid");
  if (!container) {
    return;
  }

  const items = [
    {
      title: cmsValue("infoCardOneTitle", "Trusted Diagnostics"),
      description: cmsValue("infoCardOneText", "Advanced pathology, ECG, imaging, and coordinated diagnostic workflows under one roof.")
    },
    {
      title: cmsValue("infoCardTwoTitle", "Specialist OPD"),
      description: cmsValue("infoCardTwoText", "Experienced doctors across key departments with structured consultation and follow-up support.")
    },
    {
      title: cmsValue("infoCardThreeTitle", "Emergency & ICU"),
      description: cmsValue("infoCardThreeText", "24x7 emergency response access with critical care readiness whenever patients need urgent attention.")
    },
    {
      title: cmsValue("infoCardFourTitle", "Cashless Support"),
      description: cmsValue("infoCardFourText", "Guided patient coordination for scheme-linked treatment pathways and supportive documentation help.")
    }
  ];

  container.innerHTML = items
    .map(
      (item, index) => `
        <article class="floating-info-card__item" data-motion="fadeUp" style="--motion-delay:${index * 70}ms">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </article>
      `
    )
    .join("");

  motion.refresh();
}

function renderFeatureSection() {
  const container = document.getElementById("healthcareGrid");
  const description = document.getElementById("healthcareFeatureDescription");
  if (!container) {
    return;
  }

  if (description) {
    description.textContent = cmsValue(
      "healthcareFeatureDescription",
      "Integrated diagnostics, emergency support, specialist access, and patient assistance organized through one premium care system."
    );
  }

  const items = [
    {
      title: cmsValue("healthcareFeatureServiceOneTitle", "Trusted Diagnostics"),
      description: cmsValue("healthcareFeatureServiceOneText", "Reliable testing and reporting designed for clear clinical decision-making."),
      fallbackImage: "/images/WhatsApp Image 2026-03-15 at 6.57.54 PM (1).jpeg",
      fallbackAlt: "Diagnostic support environment at Banerjee Diagnostic Foundation and Hospaccx"
    },
    {
      title: cmsValue("healthcareFeatureServiceTwoTitle", "Specialist OPD"),
      description: cmsValue("healthcareFeatureServiceTwoText", "Organized diagnostic workflows with supportive patient coordination."),
      fallbackImage: "/images/reception.jpg",
      fallbackAlt: "Patient support and OPD environment at Banerjee Diagnostic Foundation and Hospaccx"
    },
    {
      title: cmsValue("healthcareFeatureServiceThreeTitle", "Emergency & ICU"),
      description: cmsValue("healthcareFeatureServiceThreeText", "Consultant availability across multiple departments and patient needs."),
      fallbackImage: "/images/WhatsApp Image 2026-03-15 at 6.57.54 PM (2).jpeg",
      fallbackAlt: "Emergency and ICU support environment at Banerjee Diagnostic Foundation and Hospaccx"
    },
    {
      title: cmsValue("healthcareFeatureServiceFourTitle", "Cashless Support"),
      description: cmsValue("healthcareFeatureServiceFourText", "Fast support pathway for urgent care, ICU, and immediate evaluation."),
      fallbackImage: "/images/reception (2).jpg",
      fallbackAlt: "Cashless support and patient helpdesk environment at Banerjee Diagnostic Foundation and Hospaccx"
    }
  ];

  container.innerHTML = items
    .map((item, index) => {
      const media = getSectionMediaItem("healthcare", index + 1);
      const imageUrl = media?.imageUrl || item.fallbackImage;
      const imageAlt = media?.alt || media?.title || item.fallbackAlt || item.title;

      return `
          <article class="testimonial-card healthcare-restore-card" data-motion="${index % 2 === 0 ? "slideLeft" : "slideRight"}" style="--motion-delay:${index * 70}ms">
            <div class="section-media-card__image-wrap">
              ${imageMarkup(imageUrl, imageAlt, "section-media-card__image")}
              <span class="section-media-card__badge">${escapeHtml(media?.category || cmsValue("healthcareEyebrow", "Complete Healthcare"))}</span>
            </div>
            <div class="section-media-card__content">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            </div>
          </article>
        `
    })
    .join("");

  motion.refresh();
}

function applyDoctorsSectionContent() {
  const badge = document.getElementById("doctorsOverlayBadge");
  const description = document.getElementById("doctorsOverlayDescription");
  const section = document.getElementById("doctors");

  if (badge) {
    badge.textContent = cmsValue("doctorsOverlayBadge", "Doctor Information");
  }

  if (description) {
    description.textContent = cmsValue(
      "doctorsOverlayDescription",
      "Explore specialist availability, view doctor profiles, and book appointments through a clearer, more guided experience."
    );
  }

  const mediaImage = getSectionMediaItem("doctorsOverlay", 1);
  const imageUrl = mediaImage?.imageUrl || cmsValue("doctorsOverlayImageUrl", "/images/reception.jpg");
  if (section && imageUrl) {
    section.style.setProperty("--doctors-overlay-image", `url("${imageUrl}")`);
  }
}

function renderFacilities() {
  const container = document.getElementById("facilityGrid");
  if (!container) {
    return;
  }

  container.innerHTML = facilities
    .map(
      (facility) => `
        <article class="facility-card">
          <span class="facility-card__icon">${escapeHtml(facility.icon)}</span>
          <h3>${escapeHtml(facility.title)}</h3>
          <p>${escapeHtml(facility.description)}</p>
        </article>
      `
    )
    .join("");

  motion.refresh();
}

function renderServices() {
  const container = document.getElementById("serviceGrid");
  if (!container) {
    return;
  }

  container.innerHTML = state.services
    .map(
      (service, index) => {
        const media = getSectionMediaItem("services", index + 1);
        const motionVariant = index % 2 === 0 ? "slideLeft" : "slideRight";

        return `
        <article class="service-card service-card--media" data-motion="${motionVariant}" style="--motion-delay:${index * 80}ms">
          ${
            media
              ? `
                <div class="service-card__media-wrap">
                  ${imageMarkup(media.imageUrl, media.alt || service.title, "service-card__media")}
                  <span class="service-card__media-badge">${escapeHtml(media.category || "Laboratory")}</span>
                </div>
              `
              : ""
          }
          <div class="service-card__body">
            <span class="service-card__icon" aria-hidden="true">${escapeHtml(service.icon)}</span>
            <h3>${escapeHtml(service.title)}</h3>
            <p>${escapeHtml(service.description)}</p>
          </div>
        </article>
      `;
      }
    )
    .join("");

  motion.refresh();
}

function renderTreatmentPreviews() {
  const container = document.getElementById("treatmentPreviewGrid");
  if (!container) {
    return;
  }

  container.innerHTML = treatments
    .slice(0, 4)
    .map(
      (item) => `
        <article class="resource-card">
          <p class="resource-card__eyebrow">Treatment</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.summary)}</p>
          <a href="/treatments.html#${escapeHtml(item.slug)}" class="resource-card__link">Read details</a>
        </article>
      `
    )
    .join("");

  motion.refresh();
}

function renderBlogPreview() {
  const container = document.getElementById("blogPreviewList");
  if (!container) {
    return;
  }

  container.innerHTML = blogPosts
    .slice(0, 3)
    .map(
      (post) => `
        <article class="mini-list__item">
          <p class="resource-card__eyebrow">${escapeHtml(post.category)} • ${escapeHtml(post.readTime)}</p>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.excerpt)}</p>
        </article>
      `
    )
    .join("");

  motion.refresh();
}

function truncateReviewText(text, maxLength = 180) {
  const value = String(text || "").trim();
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
}

function updateReviewSummary() {
  const reviewAverage = document.getElementById("reviewAverage");
  const reviewAverageStars = document.getElementById("reviewAverageStars");
  const reviewCountText = document.getElementById("reviewCountText");
  const reviewSourceNote = document.getElementById("reviewSourceNote");
  const count = state.reviews.length;
  const average = count
    ? state.reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / count
    : 0;

  if (reviewAverage) {
    reviewAverage.textContent = count ? average.toFixed(1) : "0.0";
  }

  if (reviewAverageStars) {
    reviewAverageStars.innerHTML = count ? renderStarString(Math.round(average)) : "&#9734;&#9734;&#9734;&#9734;&#9734;";
  }

  if (reviewCountText) {
    reviewCountText.textContent = count
      ? `${count} patient review${count === 1 ? "" : "s"} shared with our clinic`
      : "Be the first patient to share a review";
  }

  if (reviewSourceNote) {
    reviewSourceNote.textContent =
      state.reviewsSource === "firestore"
        ? "Patient reviews are updated from our live feedback records."
        : "Patient reviews are currently shown from our website feedback list.";
  }
}

function renderTestimonials() {
  const grid = document.getElementById("testimonialGrid");
  const loadMoreButton = document.getElementById("reviewsLoadMore");
  if (!grid) {
    return;
  }

  const visibleReviews = state.reviews.slice(0, state.visibleReviewCount);

  grid.innerHTML = visibleReviews.length
    ? visibleReviews
        .map(
          (item) => `
            <article class="testimonial-card review-card">
              <div class="review-card__stars" aria-label="${escapeHtml(String(item.rating))} star rating">${renderStarString(item.rating)}</div>
              <p class="review-card__text">${escapeHtml(truncateReviewText(item.feedback))}</p>
              <div class="review-card__footer">
                <strong>${escapeHtml(item.name || "Anonymous Patient")}</strong>
                ${item.date ? `<span>${escapeHtml(item.date)}</span>` : ""}
              </div>
            </article>
          `
        )
        .join("")
    : `<article class="state-card"><h3>No reviews yet</h3><p>Be the first to share your experience with our clinic.</p></article>`;

  if (loadMoreButton) {
    loadMoreButton.hidden = state.reviews.length <= state.visibleReviewCount;
    if (!loadMoreButton.dataset.ready) {
      loadMoreButton.dataset.ready = "true";
      loadMoreButton.addEventListener("click", () => {
        state.visibleReviewCount += 3;
        renderTestimonials();
      });
    }
  }

  updateReviewSummary();
  motion.refresh();
}

function openGalleryLightbox(src, alt = "") {
  const lightbox = document.getElementById("siteLightbox");
  const image = document.getElementById("siteLightboxImage");

  if (!lightbox || !image || !src) {
    return;
  }

  image.setAttribute("src", src);
  image.setAttribute("alt", alt);
  openAnimatedLayer(lightbox);
  document.body.classList.add("modal-open");
}

function closeGalleryLightbox() {
  const lightbox = document.getElementById("siteLightbox");
  if (!lightbox) {
    return;
  }

  closeAnimatedLayer(lightbox, () => {
    document.body.classList.remove("modal-open");
  });
}

function setupReviewForm() {
  const form = document.getElementById("reviewForm");
  const message = document.getElementById("reviewFormMessage");
  const submitButton = document.getElementById("reviewSubmitButton");
  const stars = Array.from(form?.querySelectorAll("#reviewStars label") || []);

  if (!form || form.dataset.ready === "true") {
    return;
  }

  form.dataset.ready = "true";

  const syncReviewStars = (selectedRating = 0) => {
    stars.forEach((label, index) => {
      label.classList.toggle("is-active", index < selectedRating);
    });
  };

  stars.forEach((label) => {
    const input = label.querySelector("input");
    const value = Number(label.dataset.value || input?.value || 0);

    label.addEventListener("mouseenter", () => {
      syncReviewStars(value);
    });

    label.addEventListener("click", () => {
      syncReviewStars(value);
    });

    input?.addEventListener("focus", () => {
      syncReviewStars(value);
    });

    input?.addEventListener("change", () => {
      syncReviewStars(Number(input.value || 0));
    });
  });

  form.addEventListener("mouseleave", () => {
    const selectedInput = form.querySelector('input[name="rating"]:checked');
    syncReviewStars(Number(selectedInput?.value || 0));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const rating = Number(formData.get("rating"));
    const feedback = String(formData.get("message") || "").trim();
    const name = String(formData.get("name") || "").trim();

    if (!rating || rating < 1 || rating > 5) {
      if (message) {
        message.textContent = "Please select a star rating before submitting your review.";
      }
      return;
    }

    if (feedback.length < 20) {
      if (message) {
        message.textContent = "Please share a slightly more detailed review so it remains helpful for other patients.";
      }
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      await createReview({
        name: name || "Anonymous Patient",
        rating,
        feedback
      });
      form.reset();
      syncReviewStars(0);

      if (message) {
        message.textContent = "Thank you. Your review has been received and will appear after approval.";
      }
    } catch (error) {
      console.error(error);
      if (message) {
        message.textContent = "Something went wrong while submitting your review. Please try again.";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = cmsValue("reviewSubmitLabel", "Submit Review");
      }
    }
  });
}

async function initializeReviews() {
  state.reviews = testimonials;
  state.reviewsSource = "local";
  renderTestimonials();
  setupReviewForm();

  try {
    const { reviews, source } = await loadReviews();
    state.reviews = reviews;
    state.reviewsSource = source;
    renderTestimonials();
    setupReviewForm();
  } catch (error) {
    console.error(error);
    state.reviews = [];
    state.reviewsSource = "local";
    renderTestimonials();

    const reviewSourceNote = document.getElementById("reviewSourceNote");
    if (reviewSourceNote) {
      reviewSourceNote.textContent = "Reviews could not be loaded right now. Please try again shortly.";
    }
  }
}

async function initializeMedia() {
  state.mediaItems = fallbackMediaItems;
  state.mediaSource = "local";
  renderHeroMedia();
  renderMediaHighlights();
  renderWhyChooseMedia();
  renderHealthcareMedia();
  renderPharmacyMedia();
  renderServices();
  renderGallery();
  applyDoctorsSectionContent();

  try {
    const { items, source } = await loadMediaItems();
    state.mediaItems = items?.length ? items : fallbackMediaItems;
    state.mediaSource = source;
    renderHeroMedia();
    renderMediaHighlights();
    renderWhyChooseMedia();
    renderHealthcareMedia();
    renderPharmacyMedia();
    renderServices();
    renderGallery();
    applyDoctorsSectionContent();
  } catch (error) {
    console.error(error);
    state.mediaItems = fallbackMediaItems;
    state.mediaSource = "local";
    renderHeroMedia();
    renderMediaHighlights();
    renderWhyChooseMedia();
    renderHealthcareMedia();
    renderPharmacyMedia();
    renderServices();
    renderGallery();
    applyDoctorsSectionContent();
  }
}

async function initializeContent() {
  state.cmsContent = DEFAULT_CMS_CONTENT;
  state.cmsSource = "local";
  state.services = diagnosticServices;
  state.servicesSource = "local";
  state.heroContent = DEFAULT_HERO_CONTENT;
  state.heroSource = "local";
  applyCmsContent();
  applyHeroContent();
  renderWhyChooseMedia();
  renderHealthcareMedia();
  renderPharmacyMedia();
  renderServices();

  try {
    const [{ content, source: cmsSource }, { services, source: servicesSource }, { content: heroContent, source: heroSource }] = await Promise.all([
      loadCmsContent(),
      loadDiagnosticServices(),
      loadHeroContent()
    ]);

    state.cmsContent = content;
    state.cmsSource = cmsSource;
    state.services = services;
    state.servicesSource = servicesSource;
    state.heroContent = heroContent;
    state.heroSource = heroSource;

    applyCmsContent();
    applyHeroContent();
    renderWhyChooseMedia();
    renderHealthcareMedia();
    renderPharmacyMedia();
    renderServices();
  } catch (error) {
    console.error(error);
  }
}

function updateDoctorCount(value) {
  const doctorCount = document.getElementById("doctorCount");
  if (doctorCount) {
    doctorCount.textContent = String(value);
  }
}

function renderDoctorListSkeleton() {
  const doctorGrid = document.getElementById("doctorGrid");
  if (doctorGrid) {
    doctorGrid.innerHTML = Array.from({ length: 4 }, () => '<article class="doctor-card doctor-card--skeleton"></article>').join("");
  }

  motion.refresh();
}

function renderDoctorError(message) {
  const doctorGrid = document.getElementById("doctorGrid");
  const appointmentHelper = document.getElementById("doctorScheduleHelper");
  const html = `<article class="state-card state-card--error"><h3>Unable to load doctors</h3><p>${escapeHtml(message)}</p></article>`;

  if (doctorGrid) {
    doctorGrid.innerHTML = html;
  }

  if (appointmentHelper) {
    appointmentHelper.textContent = "Doctor schedules could not be loaded right now. Please call the clinic for help.";
  }

  motion.refresh();
}

function getFilteredDoctorsForCards() {
  return state.selectedDepartment
    ? state.doctors.filter((doctor) => doctor.department === state.selectedDepartment)
    : state.doctors;
}

function renderDoctors() {
  const container = document.getElementById("doctorGrid");
  const filter = document.getElementById("doctorDepartmentFilter");
  const allDepartmentsLabel = cmsValue("doctorsFilterPlaceholder", "All departments");

  if (filter) {
    filter.innerHTML =
      `<option value="">${escapeHtml(allDepartmentsLabel)}</option>` +
      state.departments.map((department) => `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`).join("");

    if (state.selectedDepartment && !state.departments.includes(state.selectedDepartment)) {
      state.selectedDepartment = "";
    }

    if (!filter.dataset.ready) {
      filter.dataset.ready = "true";
      filter.addEventListener("change", (event) => {
        state.selectedDepartment = event.target.value;
        renderDoctors();
      });
    }
  }

  if (filter) {
    filter.value = state.selectedDepartment;
  }

  if (!container) {
    return;
  }

  const filteredDoctors = getFilteredDoctorsForCards();

  container.innerHTML = filteredDoctors.length
    ? filteredDoctors
        .map(
          (doctor) => `
            <article class="doctor-card">
              <div class="doctor-card__header">
                <button
                  type="button"
                  class="doctor-card__avatar doctor-card__avatar-button"
                  data-doctor-poster="${escapeHtml(doctor.id)}"
                  aria-label="View profile for ${escapeHtml(doctor.name)}">
                  <img
                    src="${doctorAvatar(doctor)}"
                    alt="${escapeHtml(doctor.name)}"
                    class="doctor-card__avatar-image"
                    loading="lazy">
                </button>
                <div>
                  <p class="doctor-card__department">${escapeHtml(doctor.department)}</p>
                  <h3>${escapeHtml(doctor.name)}</h3>
                </div>
              </div>
              <p class="doctor-card__qualification">${escapeHtml(doctor.qualification)}</p>
              <p class="doctor-card__specialization">${escapeHtml(doctor.specialization)}</p>
              <ul class="doctor-card__meta">
                <li><strong>Timing:</strong> ${escapeHtml(doctor.timing)}</li>
                <li><strong>OPD Days:</strong> ${escapeHtml(doctor.opdDays)}</li>
              </ul>
              <div class="card-actions card-actions--triple">
                <button type="button" class="button button--secondary doctor-card__cta" data-doctor-poster="${escapeHtml(doctor.id)}">View Profile</button>
                <a href="tel:+919732029834" class="button button--secondary doctor-card__cta">Call Hospital</a>
                <button type="button" class="button button--secondary doctor-card__cta" data-appointment-doctor="${escapeHtml(doctor.id)}">Book Appointment</button>
              </div>
            </article>
          `
        )
        .join("")
    : '<article class="state-card"><h3>No doctors found</h3><p>Try a different department to view more specialists.</p></article>';

  container.querySelectorAll("[data-doctor-poster]").forEach((button) => {
    button.addEventListener("click", () => openDoctorModal(button.dataset.doctorPoster));
  });

  container.querySelectorAll("[data-appointment-doctor]").forEach((button) => {
    button.addEventListener("click", () => selectAppointmentDoctorById(button.dataset.appointmentDoctor));
  });

  motion.refresh();
}

function openDoctorModal(doctorId) {
  const modal = document.getElementById("doctorModal");
  const body = document.getElementById("doctorModalBody");
  const doctor = state.doctors.find((entry) => entry.id === doctorId);

  if (!modal || !body || !doctor) {
    return;
  }

  body.innerHTML = `
    <article class="profile-card profile-card--modal">
      <div class="profile-card__media">
        <img src="${doctorGalleryImage(doctor)}" alt="${escapeHtml(doctor.name)}" class="profile-card__image">
      </div>
      <div class="profile-card__body">
        <p class="doctor-card__department">${escapeHtml(doctor.department)}</p>
        <h2>${escapeHtml(doctor.name)}</h2>
        <p class="doctor-card__qualification">${escapeHtml(doctor.qualification)}</p>
        <p class="doctor-card__specialization">${escapeHtml(doctor.specialization)}</p>
        <div class="profile-card__meta">
          <article>
            <span>Availability</span>
            <strong>${escapeHtml(formatAvailability(doctor.availability))}</strong>
          </article>
          <article>
            <span>Consultation timing</span>
            <strong>${escapeHtml(doctor.timing)}</strong>
          </article>
        </div>
        <div class="detail-card__grid detail-card__grid--single">
          <section>
            <h3>Services</h3>
            <ul>
              ${doctor.services.map((service) => `<li>${escapeHtml(service)}</li>`).join("")}
            </ul>
          </section>
        </div>
        <div class="card-actions card-actions--triple">
          <a href="tel:+919732029834" class="button button--secondary">Call Hospital</a>
          <button type="button" class="button button--secondary doctor-card__cta" data-appointment-doctor="${escapeHtml(doctor.id)}">Book Appointment</button>
        </div>
      </div>
    </article>
  `;

  body.querySelector("[data-appointment-doctor]")?.addEventListener("click", () => {
    closeDoctorModal();
    window.setTimeout(() => {
      selectAppointmentDoctorById(doctor.id);
    }, 180);
  });

  openAnimatedLayer(modal);
  document.body.classList.add("modal-open");
  motion.refresh();
}

function closeDoctorModal() {
  const modal = document.getElementById("doctorModal");
  if (!modal) {
    return;
  }

  closeAnimatedLayer(modal, () => {
    document.body.classList.remove("modal-open");
  });
}

function bindDoctorModalControls() {
  const doctorModal = document.getElementById("doctorModal");
  const doctorCloseButton = document.getElementById("doctorModalClose");

  doctorCloseButton?.addEventListener("click", closeDoctorModal);

  doctorModal?.addEventListener("click", (event) => {
    if (event.target === doctorModal) {
      closeDoctorModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDoctorModal();
      closeGalleryLightbox();
    }
  });
}

function bindGlobalLightboxControls() {
  const lightbox = document.getElementById("siteLightbox");
  const closeButton = document.getElementById("siteLightboxClose");

  closeButton?.addEventListener("click", closeGalleryLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeGalleryLightbox();
    }
  });
}

function setupHeroSectionMenus() {
  const menuButtons = document.querySelectorAll("[data-scroll-target]");
  const menus = document.querySelectorAll(".hero-menu");
  const hoverEnabled = createMediaQueryList("(hover: hover) and (pointer: fine) and (min-width: 981px)");
  const closeTimers = new WeakMap();

  if (!menuButtons.length) {
    return;
  }

  menuButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const sectionId = button.dataset.scrollTarget;
      if (!sectionId) {
        return;
      }

      scrollToSection(sectionId);
      menus.forEach((menu) => {
        menu.removeAttribute("open");
      });
    });
  });

  document.addEventListener("click", (event) => {
    menus.forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.removeAttribute("open");
      }
    });
  });

  const attachHoverHandlers = () => {
    menus.forEach((menu) => {
      menu.onmouseenter = null;
      menu.onmouseleave = null;
      menu.onfocusin = null;
      menu.onfocusout = null;

      if (!hoverEnabled.matches) {
        return;
      }

      const clearCloseTimer = () => {
        const timer = closeTimers.get(menu);
        if (timer) {
          clearTimeout(timer);
          closeTimers.delete(menu);
        }
      };

      const scheduleClose = () => {
        clearCloseTimer();
        const timer = setTimeout(() => {
          menu.removeAttribute("open");
          closeTimers.delete(menu);
        }, 180);
        closeTimers.set(menu, timer);
      };

      menu.onmouseenter = () => {
        clearCloseTimer();
        menus.forEach((otherMenu) => {
          if (otherMenu !== menu) {
            otherMenu.removeAttribute("open");
          }
        });
        menu.setAttribute("open", "");
      };

      menu.onmouseleave = scheduleClose;
      menu.onfocusin = () => {
        clearCloseTimer();
        menu.setAttribute("open", "");
      };
      menu.onfocusout = scheduleClose;
    });
  };

  attachHoverHandlers();
  bindMediaQueryChange(hoverEnabled, attachHoverHandlers);
}

function populateDepartmentSelect() {
  const select = document.getElementById("department");
  if (!select) {
    return;
  }

  const departments = state.departments;
  select.innerHTML =
    `<option value="">${escapeHtml(cmsValue("appointmentDepartmentPlaceholder", "Select a department"))}</option>` +
    departments.map((department) => `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`).join("");
  select.value = "";
}

function populateDoctorSelect(department, selectedDoctor = "") {
  const doctorSelect = document.getElementById("doctor");
  const timeSelect = document.getElementById("time");
  const dateSelect = document.getElementById("date");
  const helper = document.getElementById("doctorScheduleHelper");

  if (!doctorSelect || !timeSelect || !dateSelect || !helper) {
    return;
  }

  const matchingDoctors = state.doctors.filter((doctor) => doctor.department === department);

  doctorSelect.innerHTML = matchingDoctors.length
    ? `<option value="">${escapeHtml(cmsValue("appointmentDoctorLabel", "Select Doctor"))}</option>` +
      matchingDoctors.map((doctor) => `<option value="${escapeHtml(doctor.name)}">${escapeHtml(doctor.name)}</option>`).join("")
    : `<option value="">${escapeHtml(cmsValue("appointmentDoctorPlaceholder", "Select a department first"))}</option>`;

  doctorSelect.value = matchingDoctors.some((doctor) => doctor.name === selectedDoctor) ? selectedDoctor : "";
  doctorSelect.disabled = matchingDoctors.length === 0;
  dateSelect.innerHTML = '<option value="">Select a doctor first</option>';
  dateSelect.disabled = true;
  timeSelect.innerHTML = `<option value="">${escapeHtml(cmsValue("appointmentTimePlaceholder", "Select a doctor first"))}</option>`;
  dateSelect.innerHTML = `<option value="">${escapeHtml(cmsValue("appointmentDatePlaceholder", "Select a doctor first"))}</option>`;
  timeSelect.disabled = true;
  resetAppointmentOtpState();
  setAppointmentSlotStatus("");
  helper.textContent = matchingDoctors.length
    ? cmsValue("appointmentDoctorHelper", "Select a doctor to view available timing and OPD days.")
    : cmsValue("appointmentDoctorPlaceholder", "Select a department first");
}

function resetAppointmentSelections() {
  const departmentSelect = document.getElementById("department");
  const doctorSelect = document.getElementById("doctor");
  const helper = document.getElementById("doctorScheduleHelper");

  if (departmentSelect) {
    departmentSelect.value = "";
  }

  if (doctorSelect) {
    doctorSelect.innerHTML = `<option value="">${escapeHtml(cmsValue("appointmentDoctorPlaceholder", "Select a department first"))}</option>`;
    doctorSelect.value = "";
    doctorSelect.disabled = true;
  }

  if (helper) {
    helper.textContent = cmsValue("appointmentDoctorHelper", "Select a doctor to view available timing and OPD days.");
  }

  resetControlledBookingState();
  setupInitialFormState();
}

function resetControlledBookingState() {
  if (state.appointmentBooking.otpTimerId) {
    window.clearInterval(state.appointmentBooking.otpTimerId);
  }

  state.appointmentBooking = {
    ...state.appointmentBooking,
    activeDoctorId: "",
    controlled: false,
    bookingOpen: true,
    otpRequired: false,
    otpConfigured: false,
    dates: [],
    otpRequestId: "",
    otpVerified: false,
    otpExpiresAt: "",
    otpTimerId: null,
  };

  resetAppointmentOtpState();
  setAppointmentSlotStatus("");
}

function resetAppointmentOtpState() {
  if (state.appointmentBooking.otpTimerId) {
    window.clearInterval(state.appointmentBooking.otpTimerId);
    state.appointmentBooking.otpTimerId = null;
  }

  state.appointmentBooking.otpRequestId = "";
  state.appointmentBooking.otpVerified = false;
  state.appointmentBooking.otpExpiresAt = "";

  const otpInput = document.getElementById("appointmentOtp");
  const otpInputWrap = document.getElementById("appointmentOtpInputWrap");
  const verifyButton = document.getElementById("appointmentVerifyOtp");
  const countdown = document.getElementById("appointmentOtpCountdown");

  if (otpInput) {
    otpInput.value = "";
    otpInput.disabled = false;
  }

  if (otpInputWrap) {
    otpInputWrap.hidden = true;
  }

  if (verifyButton) {
    verifyButton.hidden = true;
    verifyButton.disabled = false;
    verifyButton.textContent = "Verify OTP";
  }

  if (countdown) {
    countdown.textContent = "";
  }

  updateAppointmentOtpPanel();
  setAppointmentOtpStatus("");
}

function setAppointmentOtpStatus(message, tone = "") {
  const element = document.getElementById("appointmentOtpStatus");
  if (!element) {
    return;
  }

  element.textContent = message || "";
  element.dataset.tone = tone || "";
}

function setAppointmentSlotStatus(message, tone = "") {
  const element = document.getElementById("appointmentSlotStatus");
  if (!element) {
    return;
  }

  element.textContent = message || "";
  element.dataset.tone = tone || "";
  element.hidden = !message;
}

function setAppointmentTermsError(message = "") {
  const element = document.getElementById("appointmentTermsError");
  if (!element) {
    return;
  }

  element.textContent = message;
  element.hidden = !message;
}

function updateAppointmentOtpPanel() {
  const panel = document.getElementById("appointmentOtpPanel");
  if (!panel) {
    return;
  }
  panel.hidden = true;
}

function startAppointmentOtpCountdown(expiresAt) {
  if (state.appointmentBooking.otpTimerId) {
    window.clearInterval(state.appointmentBooking.otpTimerId);
  }

  const countdown = document.getElementById("appointmentOtpCountdown");
  if (!countdown) {
    return;
  }

  const tick = () => {
    const remainingMs = new Date(expiresAt).getTime() - Date.now();
    if (remainingMs <= 0) {
      countdown.textContent = "OTP expired";
      if (state.appointmentBooking.otpTimerId) {
        window.clearInterval(state.appointmentBooking.otpTimerId);
        state.appointmentBooking.otpTimerId = null;
      }
      return;
    }

    const remainingSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    countdown.textContent = `OTP expires in ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  tick();
  state.appointmentBooking.otpTimerId = window.setInterval(tick, 1000);
}

function getControlledDateEntry(dateValue) {
  return state.appointmentBooking.dates.find((entry) => entry.date === dateValue) || null;
}

function defaultControlledTimeSlots() {
  return ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM"];
}

function isBiswajitControlledDoctor(doctor) {
  const normalizedName = String(doctor?.name || "").trim().toLowerCase().replace(/\s+/g, " ");
  return normalizedName === "dr. biswajit majumdar" || normalizedName === "dr biswajit majumdar";
}

function buildSerialSlots(limit, bookedSlots = []) {
  const normalizedLimit = Number(limit || 0);
  const blocked = new Set(
    (Array.isArray(bookedSlots) ? bookedSlots : [])
      .map((slot) => String(slot || "").trim())
      .filter(Boolean),
  );

  return Array.from({ length: normalizedLimit }, (_, index) => `Slot ${index + 1}`).filter((slot) => !blocked.has(slot));
}

function controlledTimeSlotsForDoctor(doctor, entry) {
  if (isBiswajitControlledDoctor(doctor)) {
    return buildSerialSlots(entry?.limit || 0, entry?.bookedSlots || []);
  }

  if (Array.isArray(entry?.timeSlots) && entry.timeSlots.length) {
    const blocked = new Set(
      (Array.isArray(entry?.bookedSlots) ? entry.bookedSlots : [])
        .map((slot) => String(slot || "").trim())
        .filter(Boolean),
    );
    return entry.timeSlots.filter((slot) => !blocked.has(slot));
  }

  const ranges = extractTimeRanges(doctor.timing);
  if (doctor.timing.toUpperCase().includes("BY APPOINTMENT") || ranges.length === 0) {
    return defaultControlledTimeSlots();
  }

  const slots = [];
  ranges.forEach((range) => {
    for (let minutes = range.start; minutes <= range.end; minutes += 30) {
      const formatted = formatMinutes(minutes);
      if (!slots.includes(formatted)) {
        slots.push(formatted);
      }
    }
  });

  return slots.length ? slots : defaultControlledTimeSlots();
}

function renderSelectedDateStatus() {
  const dateSelect = document.getElementById("date");
  if (!dateSelect || !state.appointmentBooking.controlled) {
    setAppointmentSlotStatus("");
    return;
  }

  const entry = getControlledDateEntry(dateSelect.value);
  if (!entry) {
    setAppointmentSlotStatus(
      state.appointmentBooking.bookingOpen ? "Select an available date to continue." : "Booking is currently closed for this doctor.",
      state.appointmentBooking.bookingOpen ? "" : "error",
    );
    return;
  }

  if (entry.isFull) {
    setAppointmentSlotStatus("Fully booked", "error");
    return;
  }

  setAppointmentSlotStatus(`Slots Left: ${entry.slotsLeft} / ${entry.limit}`, "success");
}

function buildLocalControlledAvailability(doctor) {
  const bookingSettings = doctor?.bookingSettings;
  if (!bookingSettings?.enabled) {
    return null;
  }

  return {
    controlled: true,
    bookingOpen: bookingSettings.bookingOpen !== false,
    otpRequired: bookingSettings.otpRequired !== false,
    otpConfigured: false,
    dates: (bookingSettings.dates || []).map((entry) => ({
      date: entry.date,
      label: entry.date,
      limit: Number(entry.limit || 0),
      booked: 0,
      slotsLeft: Number(entry.limit || 0),
      isFull: Number(entry.limit || 0) <= 0,
      bookedSlots: [],
      timeSlots: Array.isArray(entry.timeSlots) ? entry.timeSlots : defaultControlledTimeSlots(),
    })),
  };
}

async function loadControlledAvailabilityForDoctor(doctor) {
  const nextToken = state.appointmentBooking.requestToken + 1;
  state.appointmentBooking.requestToken = nextToken;

  if (!doctor?.bookingSettings?.enabled) {
    resetControlledBookingState();
    return null;
  }

  try {
    const availability = await fetchControlledBookingAvailability(doctor.id);
    if (state.appointmentBooking.requestToken !== nextToken) {
      return null;
    }

    state.appointmentBooking = {
      ...state.appointmentBooking,
      activeDoctorId: doctor.id,
      controlled: Boolean(availability.controlled),
      bookingOpen: availability.bookingOpen !== false,
      otpRequired: availability.otpRequired !== false,
      otpConfigured: Boolean(availability.otpConfigured),
      dates: Array.isArray(availability.dates) ? availability.dates : [],
      otpRequestId: "",
      otpVerified: false,
      otpExpiresAt: "",
      otpTimerId: null,
    };
    updateAppointmentOtpPanel();
    return availability;
  } catch (error) {
    console.error("Unable to load controlled booking availability:", error);
    const fallbackAvailability = buildLocalControlledAvailability(doctor);

    if (!fallbackAvailability) {
      resetControlledBookingState();
      return null;
    }

    state.appointmentBooking = {
      ...state.appointmentBooking,
      activeDoctorId: doctor.id,
      controlled: true,
      bookingOpen: fallbackAvailability.bookingOpen,
      otpRequired: fallbackAvailability.otpRequired,
      otpConfigured: fallbackAvailability.otpConfigured,
      dates: fallbackAvailability.dates,
      otpRequestId: "",
      otpVerified: false,
      otpExpiresAt: "",
      otpTimerId: null,
    };
    updateAppointmentOtpPanel();
    setAppointmentOtpStatus("Live booking counters are unavailable right now. Showing saved doctor settings only.", "warning");
    return fallbackAvailability;
  }
}

function formatDateValue(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
}

function formatDateLabel(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function weekOfMonth(date) {
  return Math.floor((date.getDate() - 1) / 7) + 1;
}

function isLastWeekdayOfMonth(date) {
  const nextWeek = new Date(date);
  nextWeek.setDate(date.getDate() + 7);
  return nextWeek.getMonth() !== date.getMonth();
}

function doctorAvailableOnDate(doctor, date) {
  const rule = doctor.opdDays.toUpperCase().replace(/\s+/g, " ").trim();
  const dayName = DAYS[date.getDay()];

  if (rule === "-" || rule.includes("BY APPOINTMENT") || rule.includes("EVERY DAY") || rule.includes("EVERYDAY")) {
    return true;
  }

  if (rule.includes("LAST SUNDAY OF EVERY MONTH")) {
    return dayName === "SUNDAY" && isLastWeekdayOfMonth(date);
  }

  if (rule.includes("FIRST AND THIRD SUNDAY OF EVERY MONTH")) {
    return dayName === "SUNDAY" && [1, 3].includes(weekOfMonth(date));
  }

  if (rule.includes("EVERY MONTH FIRST 3 SATURDAY")) {
    return dayName === "SATURDAY" && weekOfMonth(date) <= 3;
  }

  return DAYS.some((day) => rule.includes(day)) ? rule.includes(dayName) : true;
}

function allowedDatesForDoctor(doctor, totalDays = 120) {
  const dates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 0; offset < totalDays; offset += 1) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + offset);
    if (doctorAvailableOnDate(doctor, candidate)) {
      dates.push(candidate);
    }
  }

  return dates;
}

function populateDateSelect(doctor) {
  const dateSelect = document.getElementById("date");
  if (!dateSelect) {
    return;
  }

  if (state.appointmentBooking.controlled && state.appointmentBooking.activeDoctorId === doctor.id) {
    const controlledDates = state.appointmentBooking.dates;
    dateSelect.innerHTML = controlledDates.length
      ? `<option value="">${escapeHtml(cmsValue("appointmentDatePlaceholder", "Select an appointment date"))}</option>` +
        controlledDates
          .map((entry) => `<option value="${escapeHtml(entry.date)}" ${entry.isFull ? "disabled" : ""}>${escapeHtml(
            entry.isFull ? `${entry.label} • Fully Booked` : `${entry.label} • Slots Left: ${entry.slotsLeft} / ${entry.limit}`,
          )}</option>`)
          .join("")
      : '<option value="">No configured booking dates available</option>';
    dateSelect.disabled = !controlledDates.length || !state.appointmentBooking.bookingOpen;
    renderSelectedDateStatus();
    return;
  }

  const dates = allowedDatesForDoctor(doctor);
  dateSelect.innerHTML = dates.length
    ? `<option value="">${escapeHtml(cmsValue("appointmentDatePlaceholder", "Select an appointment date"))}</option>` +
      dates.map((date) => `<option value="${formatDateValue(date)}">${formatDateLabel(date)}</option>`).join("")
    : '<option value="">No valid dates available</option>';
  dateSelect.disabled = dates.length === 0;
  setAppointmentSlotStatus("");
}

function toMinutes(timeLabel) {
  const match = timeLabel.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]) % 12;
  const minutes = Number(match[2] || "0");
  const meridiem = match[3].toUpperCase();
  if (meridiem === "PM") {
    hours += 12;
  }
  return hours * 60 + minutes;
}

function formatMinutes(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${meridiem}`;
}

function extractTimeRanges(timing) {
  if (timing.toUpperCase().includes("BY APPOINTMENT")) {
    return [];
  }

  const ranges = [];
  const regex = /(\d{1,2}(?::\d{2})?\s*[AP]M)\s*TO\s*(\d{1,2}(?::\d{2})?\s*[AP]M)/gi;
  let match;

  while ((match = regex.exec(timing)) !== null) {
    const start = toMinutes(match[1].replace(/\s+/g, ""));
    const end = toMinutes(match[2].replace(/\s+/g, ""));
    if (start !== null && end !== null && end >= start) {
      ranges.push({ start, end });
    }
  }

  return ranges;
}

function buildAppointmentDateTime(dateValue, timeLabel) {
  const [year, month, day] = String(dateValue)
    .split("-")
    .map((part) => Number(part));

  if (!year || !month || !day) {
    return String(dateValue);
  }

  const appointmentDate = new Date(year, month - 1, day, 9, 0, 0, 0);
  const minutes = toMinutes(String(timeLabel || "").replace(/\s+/g, " ").trim());

  if (minutes !== null) {
    appointmentDate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  }

  return appointmentDate.toISOString();
}

function populateTimeSelect(doctor) {
  const timeSelect = document.getElementById("time");
  const helper = document.getElementById("doctorScheduleHelper");
  if (!timeSelect || !helper) {
    return;
  }

  if (state.appointmentBooking.controlled && state.appointmentBooking.activeDoctorId === doctor.id) {
    const dateSelect = document.getElementById("date");
    const selectedEntry = getControlledDateEntry(dateSelect?.value || "") || state.appointmentBooking.dates[0] || null;
    const controlledSlots = controlledTimeSlotsForDoctor(doctor, selectedEntry);

    timeSelect.innerHTML = controlledSlots.length
      ? `<option value="">${escapeHtml(cmsValue("appointmentTimePlaceholder", "Select a time slot"))}</option>` +
        controlledSlots.map((slot) => `<option value="${escapeHtml(slot)}">${escapeHtml(slot)}</option>`).join("")
      : '<option value="">No configured time slots available</option>';
    timeSelect.disabled = controlledSlots.length === 0;
    helper.textContent = `${doctor.name} | Availability: ${formatAvailability(doctor.availability)} | OPD Days: ${doctor.opdDays}`;
    return;
  }

  const ranges = extractTimeRanges(doctor.timing);

  if (doctor.timing.toUpperCase().includes("BY APPOINTMENT") || ranges.length === 0) {
    const firstSlot = doctor.availability[0]?.from || "By Appointment";
    timeSelect.innerHTML = `<option value="${escapeHtml(firstSlot)}">${escapeHtml(firstSlot)}</option>`;
    timeSelect.disabled = false;
  } else {
    const slots = [];
    ranges.forEach((range) => {
      for (let minutes = range.start; minutes <= range.end; minutes += 30) {
        const formatted = formatMinutes(minutes);
        if (!slots.includes(formatted)) {
          slots.push(formatted);
        }
      }
    });

    timeSelect.innerHTML = slots.length
      ? `<option value="">${escapeHtml(cmsValue("appointmentTimePlaceholder", "Select a time slot"))}</option>` +
        slots.map((slot) => `<option value="${escapeHtml(slot)}">${escapeHtml(slot)}</option>`).join("")
      : '<option value="">Time slots unavailable</option>';
    timeSelect.disabled = slots.length === 0;
  }

  helper.textContent = `${doctor.name} | Availability: ${formatAvailability(doctor.availability)} | OPD Days: ${doctor.opdDays}`;
}

async function applySelectedDoctor(doctor) {
  await loadControlledAvailabilityForDoctor(doctor);
  populateDateSelect(doctor);
  populateTimeSelect(doctor);
}

async function prefillDoctorFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const doctorName = params.get("doctor");
  if (!doctorName) {
    resetAppointmentSelections();
    return;
  }

  const doctor = state.doctors.find((entry) => entry.name === doctorName);
  const departmentSelect = document.getElementById("department");
  const doctorSelect = document.getElementById("doctor");

  if (!doctor || !departmentSelect || !doctorSelect) {
    return;
  }

  departmentSelect.value = doctor.department;
  populateDoctorSelect(doctor.department, doctor.name);
  await applySelectedDoctor(doctor);

  const cleanedUrl = `${window.location.pathname}${window.location.hash || ""}`;
  window.history.replaceState({}, document.title, cleanedUrl);
}

function setupAppointmentForm() {
  const form = document.getElementById("whatsappAppointmentForm");
  if (!form || form.dataset.ready === "true") {
    return;
  }
  form.dataset.ready = "true";

  const departmentSelect = document.getElementById("department");
  const doctorSelect = document.getElementById("doctor");
  const dateSelect = document.getElementById("date");
  const termsCheckbox = document.getElementById("appointmentTermsCheckbox");
  const termsTrigger = document.getElementById("appointmentTermsTrigger");
  const termsLink = document.getElementById("appointmentTermsLink");
  const termsModal = document.getElementById("appointmentTermsModal");
  const termsBackdrop = document.getElementById("appointmentTermsBackdrop");
  const termsClose = document.getElementById("appointmentTermsClose");
  const termsContent = document.getElementById("appointmentTermsContent");
  const termsAccept = document.getElementById("appointmentTermsAccept");
  const termsHint = document.getElementById("appointmentTermsHint");

  const closeTermsModal = () => {
    if (termsModal) {
      termsModal.hidden = true;
    }
  };

  const syncTermsAcceptState = () => {
    if (!termsContent || !termsAccept || !termsHint) {
      return;
    }

    const canAccept = termsContent.scrollTop + termsContent.clientHeight >= termsContent.scrollHeight - 12;
    termsAccept.disabled = !canAccept;
    termsHint.textContent = canAccept
      ? "এখন আপনি শর্তগুলি গ্রহণ করে এগোতে পারেন। / You can now accept the terms and continue."
      : "গ্রহণ করার জন্য নিচ পর্যন্ত স্ক্রল করুন। / Scroll to the bottom to enable acceptance.";
  };

  const openTermsModal = () => {
    if (!termsModal || !termsContent || !termsAccept) {
      return;
    }

    termsModal.hidden = false;
    termsContent.scrollTop = 0;
    termsAccept.disabled = true;
    syncTermsAcceptState();
  };

  termsCheckbox?.addEventListener("click", (event) => {
    event.preventDefault();
    openTermsModal();
  });

  termsTrigger?.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.id === "appointmentTermsLink") {
      return;
    }
    event.preventDefault();
    openTermsModal();
  });

  termsLink?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openTermsModal();
  });

  termsBackdrop?.addEventListener("click", closeTermsModal);
  termsClose?.addEventListener("click", closeTermsModal);
  termsContent?.addEventListener("scroll", syncTermsAcceptState);
  termsAccept?.addEventListener("click", () => {
    if (termsCheckbox instanceof HTMLInputElement) {
      termsCheckbox.checked = true;
    }
    setAppointmentTermsError("");
    closeTermsModal();
  });

  departmentSelect?.addEventListener("change", (event) => {
    populateDoctorSelect(event.target.value);
  });

  doctorSelect?.addEventListener("change", async (event) => {
    const doctor = state.doctors.find((entry) => entry.name === event.target.value);
    if (!doctor) {
      resetControlledBookingState();
      return;
    }
    await applySelectedDoctor(doctor);
  });

  dateSelect?.addEventListener("change", () => {
    renderSelectedDateStatus();
    if (state.appointmentBooking.controlled) {
      const doctor = state.doctors.find((entry) => entry.name === doctorSelect?.value);
      if (doctor) {
        populateTimeSelect(doctor);
      }
      resetAppointmentOtpState();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      return;
    }

    const hasAcceptedTerms = termsCheckbox instanceof HTMLInputElement ? termsCheckbox.checked : false;
    if (!hasAcceptedTerms) {
      setAppointmentTermsError("Please accept Terms & Conditions to continue");
      openTermsModal();
      return;
    }

    setAppointmentTermsError("");

    const formData = new FormData(form);
    const selectedDate = String(formData.get("date") || "");
    const selectedTime = String(formData.get("time") || "");
    const selectedDepartment = String(formData.get("department") || "");
    const selectedDoctor = String(formData.get("doctor") || "");
    const doctor = state.doctors.find((entry) => entry.name === selectedDoctor);
    setAppointmentSubmitState(true);

    try {
      if (doctor && state.appointmentBooking.controlled && state.appointmentBooking.activeDoctorId === doctor.id) {
        if (!state.appointmentBooking.bookingOpen) {
          throw new Error("Booking is currently closed for this doctor.");
        }

        const selectedEntry = getControlledDateEntry(selectedDate);
        if (!selectedEntry || selectedEntry.isFull) {
          throw new Error("No slots available for the selected date.");
        }

        const result = await confirmControlledAppointment({
          doctorId: doctor.id,
          selectedDate,
          selectedTime,
          name: String(formData.get("name") || "").trim(),
          dateOfBirth: String(formData.get("dateOfBirth") || "").trim(),
          phone: String(formData.get("phone") || "").trim(),
          termsAccepted: true,
          message: `Date of Birth: ${String(formData.get("dateOfBirth") || "").trim()} | Department: ${selectedDepartment} | Preferred Date: ${selectedDate} | Preferred Time: ${selectedTime}`,
        });

        window.location.href = result.clinicWhatsappUrl;
        return;
      }

      await saveAppointmentWithTimeout({
        name: String(formData.get("name") || "").trim(),
        dateOfBirth: String(formData.get("dateOfBirth") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        date: buildAppointmentDateTime(selectedDate, selectedTime),
        doctor: selectedDoctor,
        doctorId: doctor?.id || "",
        department: selectedDepartment,
        selectedDate,
        selectedTime,
        termsAccepted: true,
        message: `Date of Birth: ${String(formData.get("dateOfBirth") || "").trim()} | Department: ${selectedDepartment} | Preferred Date: ${selectedDate} | Preferred Time: ${selectedTime}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Unable to save appointment to Firestore:", error);
      setAppointmentOtpStatus(error instanceof Error ? error.message : "Unable to save appointment.", "error");
      setAppointmentSubmitState(false);
      return;
    } finally {
      setAppointmentSubmitState(false);
    }

    const message = [
      "Hello, I want to book an appointment.",
      "",
      `Name: ${formData.get("name")}`,
      `Date of Birth: ${formData.get("dateOfBirth")}`,
      `Phone: ${formData.get("phone")}`,
      `Department: ${selectedDepartment}`,
      `Doctor: ${selectedDoctor}`,
      `Preferred Date: ${selectedDate}`,
      `Preferred Time: ${selectedTime}`
    ].join("\n");

    window.location.href = "https://wa.me/917384251751?text=" + encodeURIComponent(message);
  });
}

function setupInitialFormState() {
  const dateSelect = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  if (dateSelect) {
    dateSelect.innerHTML = `<option value="">${escapeHtml(cmsValue("appointmentDatePlaceholder", "Select a doctor first"))}</option>`;
    dateSelect.disabled = true;
  }
  if (timeSelect) {
    timeSelect.innerHTML = `<option value="">${escapeHtml(cmsValue("appointmentTimePlaceholder", "Select a doctor first"))}</option>`;
    timeSelect.disabled = true;
  }
  setAppointmentSlotStatus("");
  updateAppointmentOtpPanel();
}

function setAppointmentSubmitState(isSubmitting) {
  const form = document.getElementById("whatsappAppointmentForm");
  const submitButton = form?.querySelector('button[type="submit"]');

  if (!submitButton) {
    return;
  }

  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting ? "Submitting..." : cmsValue("appointmentButtonLabel", "Submit Appointment");
}

async function saveAppointmentWithTimeout(payload, timeoutMs = 1800) {
  const timeoutPromise = new Promise((_, reject) => {
    window.setTimeout(() => reject(new Error("Appointment save timed out.")), timeoutMs);
  });

  return Promise.race([createAppointment(payload), timeoutPromise]);
}

async function initializeDoctors() {
  const sourceBadge = document.getElementById("doctorDataSource");
  const hasDoctorQuery = new URLSearchParams(window.location.search).has("doctor");

  state.doctors = [];
  state.departments = [];
  state.doctorsSource = "loading";

  updateDoctorCount(0);
  renderDepartments();
  renderDoctors();
  populateDepartmentSelect();
  setupAppointmentForm();
  if (hasDoctorQuery) {
    await prefillDoctorFromQuery();
  } else {
    resetAppointmentSelections();
  }

  if (sourceBadge) {
    sourceBadge.textContent = cmsValue(
      "doctorsDataSourceLocal",
      "Doctor information is curated and regularly updated by our clinic team.",
    );
  }

  try {
    const { doctors, source } = await loadDoctors();
    const resolvedDoctors = doctors?.length ? doctors : fallbackDoctors;
    state.doctors = resolvedDoctors;
    state.departments = deriveDepartments(resolvedDoctors);
    state.doctorsSource = source;

    updateDoctorCount(resolvedDoctors.length);
    renderDepartments();
    renderDoctors();
    populateDepartmentSelect();
    if (hasDoctorQuery) {
      await prefillDoctorFromQuery();
    } else {
      resetAppointmentSelections();
    }

    if (sourceBadge) {
      sourceBadge.textContent =
        source === "firestore"
          ? cmsValue("doctorsDataSourceFirestore", "Doctor information is updated from the clinic records.")
          : cmsValue("doctorsDataSourceLocal", "Doctor information is curated and regularly updated by our clinic team.");
    }
  } catch (error) {
    console.error(error);
    state.doctors = fallbackDoctors;
    state.departments = deriveDepartments(fallbackDoctors);
    state.doctorsSource = "local";
    updateDoctorCount(fallbackDoctors.length);
    renderDepartments();
    renderDoctors();
    populateDepartmentSelect();
    if (hasDoctorQuery) {
      await prefillDoctorFromQuery();
    } else {
      resetAppointmentSelections();
    }

    if (sourceBadge) {
      sourceBadge.textContent = cmsValue(
        "doctorsDataSourceLocal",
        "Doctor information is curated and regularly updated by our clinic team.",
      );
    }
  }
}

  renderTrustIndicators();
  renderFloatingInfoCard();
  renderFacilities();
  applyDoctorsSectionContent();
renderWhyChooseMedia();
renderHealthcareMedia();
renderPharmacyMedia();
renderServices();
renderTreatmentPreviews();
renderBlogPreview();
bindGlobalLightboxControls();
setupHeroSectionMenus();
motion = createMotionSystem(document);
motion.refresh();
setupReviewForm();
bindDoctorModalControls();
initializeContent();
initializeReviews();
initializeMedia();
initializeDoctors();

window.addEventListener("pageshow", () => {
  const params = new URLSearchParams(window.location.search);
  setAppointmentSubmitState(false);
  if (!params.get("doctor")) {
    populateDepartmentSelect();
    resetAppointmentSelections();
  }
});
