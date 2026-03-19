import "./styles.css";
import { galleryItems } from "./data/gallery";
import { blogPosts, diagnosticServices, facilities, treatments, trustIndicators } from "./data/content";
import { doctors as fallbackDoctors } from "./data/doctors";
import { createAppointment } from "./firebase/appointments-store";
import { loadDoctors } from "./firebase/doctors-store";
import { loadCmsContent, loadDiagnosticServices } from "./firebase/content-store";
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
  galleryDepartment: "",
  searchQuery: "",
  doctorsSource: "local",
  cmsSource: "local",
  servicesSource: "local",
  cmsContent: null,
  services: diagnosticServices,
  reviews: [],
  reviewsSource: "local",
  visibleReviewCount: 6
};

let motion = {
  refresh() {},
  disconnect() {}
};

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
  if (!value) {
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

function applyCmsContent() {
  const content = state.cmsContent;
  if (!content) {
    return;
  }

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

function doctorAvatar(doctor) {
  return doctor.image || (doctor.gender === "female" ? "/images/doctor-female.jpeg" : "/images/doctor-male.jpeg");
}

function doctorGalleryImage(doctor) {
  return doctor.posterImage || doctorAvatar(doctor);
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
  if (!container) {
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

function renderGallery() {
  const container = document.getElementById("galleryGrid");
  if (!container) {
    return;
  }

  container.innerHTML = galleryItems
    .map(
      (item) => `
        <figure class="gallery-card${item.large ? " gallery-card--large" : ""}">
          <img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy">
          <figcaption>
            <span>${escapeHtml(item.caption)}</span>
            ${item.link ? `<a class="gallery-card__link" href="${item.link}" target="_blank" rel="noreferrer">Open location</a>` : ""}
          </figcaption>
        </figure>
      `
    )
    .join("");

  motion.refresh();
}

function renderTrustIndicators() {
  const container = document.getElementById("trustGrid");
  if (!container) {
    return;
  }

  container.innerHTML = trustIndicators
    .map(
      (item) => `
        <article class="trust-card">
          <strong>${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
        </article>
      `
    )
    .join("");

  motion.refresh();
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
      (service) => `
        <article class="service-card">
          <span class="service-card__icon" aria-hidden="true">${escapeHtml(service.icon)}</span>
          <h3>${escapeHtml(service.title)}</h3>
          <p>${escapeHtml(service.description)}</p>
        </article>
      `
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
      const createdReview = await createReview({
        name: name || "Anonymous Patient",
        rating,
        feedback
      });

      state.reviews = [createdReview, ...state.reviews];
      state.visibleReviewCount = Math.max(6, state.visibleReviewCount);
      renderTestimonials();
      form.reset();
      syncReviewStars(0);

      if (message) {
        message.textContent = "Thank you. Your review has been submitted successfully.";
      }
    } catch (error) {
      console.error(error);
      if (message) {
        message.textContent = "Something went wrong while submitting your review. Please try again.";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Review";
      }
    }
  });
}

async function initializeReviews() {
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

async function initializeContent() {
  try {
    const [{ content, source: cmsSource }, { services, source: servicesSource }] = await Promise.all([
      loadCmsContent(),
      loadDiagnosticServices()
    ]);

    state.cmsContent = content;
    state.cmsSource = cmsSource;
    state.services = services;
    state.servicesSource = servicesSource;

    applyCmsContent();
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
  const posterGrid = document.getElementById("doctorPosterGrid");
  if (doctorGrid) {
    doctorGrid.innerHTML = Array.from({ length: 4 }, () => '<article class="doctor-card doctor-card--skeleton"></article>').join("");
  }
  if (posterGrid) {
    posterGrid.innerHTML = Array.from({ length: 6 }, () => '<article class="doctor-poster doctor-poster--skeleton"></article>').join("");
  }

  motion.refresh();
}

function renderDoctorError(message) {
  const doctorGrid = document.getElementById("doctorGrid");
  const posterGrid = document.getElementById("doctorPosterGrid");
  const appointmentHelper = document.getElementById("doctorScheduleHelper");
  const html = `<article class="state-card state-card--error"><h3>Unable to load doctors</h3><p>${escapeHtml(message)}</p></article>`;

  if (doctorGrid) {
    doctorGrid.innerHTML = html;
  }

  if (posterGrid) {
    posterGrid.innerHTML = html;
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

function getFilteredDoctorsForGallery() {
  const query = state.searchQuery.trim().toLowerCase();

  return state.doctors.filter((doctor) => {
    const matchesDepartment = !state.galleryDepartment || doctor.department === state.galleryDepartment;
    const matchesSearch =
      !query ||
      doctor.name.toLowerCase().includes(query) ||
      doctor.specialization.toLowerCase().includes(query) ||
      doctor.department.toLowerCase().includes(query);

    return matchesDepartment && matchesSearch;
  });
}

function renderDoctors() {
  const container = document.getElementById("doctorGrid");
  const filter = document.getElementById("doctorDepartmentFilter");

  if (filter && !filter.dataset.ready) {
    filter.innerHTML =
      '<option value="">All departments</option>' +
      state.departments.map((department) => `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`).join("");

    filter.dataset.ready = "true";
    filter.addEventListener("change", (event) => {
      state.selectedDepartment = event.target.value;
      state.galleryDepartment = event.target.value;
      syncGalleryControls();
      renderDoctors();
      renderDoctorsGallery();
    });
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
                <span class="doctor-card__avatar" aria-hidden="true">
                  <img
                    src="${doctorAvatar(doctor)}"
                    alt=""
                    class="doctor-card__avatar-image"
                    loading="lazy">
                </span>
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
                <a href="/?doctor=${encodeURIComponent(doctor.name)}#appointment" class="button button--secondary doctor-card__cta">Book Appointment</a>
              </div>
            </article>
          `
        )
        .join("")
    : '<article class="state-card"><h3>No doctors found</h3><p>Try a different department to view more specialists.</p></article>';

  container.querySelectorAll("[data-doctor-poster]").forEach((button) => {
    button.addEventListener("click", () => openDoctorPosterPreview(button.dataset.doctorPoster));
  });

  motion.refresh();
}

function renderGalleryTabs() {
  const tabs = document.getElementById("doctorGalleryTabs");
  if (!tabs) {
    return;
  }

  const departments = ["All", ...state.departments];
  tabs.innerHTML = departments
    .map((department) => {
      const active = (department === "All" ? "" : department) === state.galleryDepartment;
      return `<button type="button" class="filter-chip${active ? " filter-chip--active" : ""}" data-department="${escapeHtml(
        department === "All" ? "" : department
      )}">${escapeHtml(department)}</button>`;
    })
    .join("");

  tabs.querySelectorAll("[data-department]").forEach((button) => {
    button.addEventListener("click", () => {
      state.galleryDepartment = button.dataset.department ?? "";
      state.selectedDepartment = state.galleryDepartment;
      syncGalleryControls();
      renderDoctors();
      renderDoctorsGallery();
    });
  });

  motion.refresh();
}

function syncGalleryControls() {
  const search = document.getElementById("doctorPosterSearch");
  if (search) {
    search.value = state.searchQuery;
  }
  renderGalleryTabs();
}

function renderDoctorsGallery() {
  const container = document.getElementById("doctorPosterGrid");
  const summary = document.getElementById("doctorPosterSummary");

  if (!container) {
    return;
  }

  const filteredDoctors = getFilteredDoctorsForGallery();

  if (summary) {
    summary.textContent = filteredDoctors.length
      ? `${filteredDoctors.length} doctors available in this gallery view`
      : "No doctors matched the current filters";
  }

  container.innerHTML = filteredDoctors.length
    ? filteredDoctors
        .map(
          (doctor) => `
            <article class="doctor-poster" data-doctor-id="${escapeHtml(doctor.id)}">
              <div class="doctor-poster__image-wrap">
                <img src="${doctorGalleryImage(doctor)}" alt="${escapeHtml(doctor.name)}" class="doctor-poster__image" loading="lazy">
              </div>
              <div class="doctor-poster__body">
                <p class="doctor-card__department">${escapeHtml(doctor.department)}</p>
                <h3>${escapeHtml(doctor.name)}</h3>
                <p>${escapeHtml(doctor.specialization)}</p>
                <button type="button" class="doctor-poster__button" data-doctor-id="${escapeHtml(doctor.id)}">View Profile</button>
              </div>
            </article>
          `
        )
        .join("")
    : '<article class="state-card"><h3>No matching doctors</h3><p>Try another department or search by a different doctor name.</p></article>';

  container.querySelectorAll("[data-doctor-id]").forEach((button) => {
    button.addEventListener("click", () => openDoctorModal(button.dataset.doctorId));
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
        <div class="card-actions">
          <a href="tel:+919732029834" class="button button--secondary">Call Hospital</a>
          <a href="/?doctor=${encodeURIComponent(doctor.name)}#appointment" class="doctor-card__action">Book Appointment</a>
        </div>
      </div>
    </article>
  `;

  openAnimatedLayer(modal);
  document.body.classList.add("modal-open");
  motion.refresh();
}

function openDoctorPosterPreview(doctorId) {
  const modal = document.getElementById("doctorModal");
  const body = document.getElementById("doctorModalBody");
  const doctor = state.doctors.find((entry) => entry.id === doctorId);

  if (!modal || !body || !doctor) {
    return;
  }

  body.innerHTML = doctor.posterImage
    ? `
        <article class="poster-only-card">
          <img src="${doctor.posterImage}" alt="${escapeHtml(doctor.name)}" class="poster-only-card__image">
        </article>
      `
    : `
        <article class="state-card">
          <h3>Poster not available</h3>
          <p>The clinic has not added a poster for ${escapeHtml(doctor.name)} yet.</p>
        </article>
      `;

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

function bindDoctorGalleryControls() {
  const search = document.getElementById("doctorPosterSearch");
  const doctorModal = document.getElementById("doctorModal");
  const doctorCloseButton = document.getElementById("doctorModalClose");

  search?.addEventListener("input", (event) => {
    state.searchQuery = event.target.value;
    renderDoctorsGallery();
  });

  doctorCloseButton?.addEventListener("click", closeDoctorModal);

  doctorModal?.addEventListener("click", (event) => {
    if (event.target === doctorModal) {
      closeDoctorModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDoctorModal();
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

  const departments = state.departments.length ? state.departments : deriveDepartments(state.doctors.length ? state.doctors : fallbackDoctors);
  select.innerHTML =
    '<option value="">Select a department</option>' +
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
    ? '<option value="">Select a doctor</option>' +
      matchingDoctors.map((doctor) => `<option value="${escapeHtml(doctor.name)}">${escapeHtml(doctor.name)}</option>`).join("")
    : '<option value="">Select a department first</option>';

  doctorSelect.value = matchingDoctors.some((doctor) => doctor.name === selectedDoctor) ? selectedDoctor : "";
  doctorSelect.disabled = matchingDoctors.length === 0;
  dateSelect.innerHTML = '<option value="">Select a doctor first</option>';
  dateSelect.disabled = true;
  timeSelect.innerHTML = '<option value="">Select a doctor first</option>';
  timeSelect.disabled = true;
  helper.textContent = matchingDoctors.length
    ? "Select a doctor to see the available appointment slots."
    : "Select a department to choose from the available doctors.";
}

function resetAppointmentSelections() {
  const departmentSelect = document.getElementById("department");
  const doctorSelect = document.getElementById("doctor");
  const helper = document.getElementById("doctorScheduleHelper");

  if (departmentSelect) {
    departmentSelect.value = "";
  }

  if (doctorSelect) {
    doctorSelect.innerHTML = '<option value="">Select a department first</option>';
    doctorSelect.value = "";
    doctorSelect.disabled = true;
  }

  if (helper) {
    helper.textContent = "Select a doctor to view available timing and OPD days.";
  }

  setupInitialFormState();
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

  const dates = allowedDatesForDoctor(doctor);
  dateSelect.innerHTML = dates.length
    ? '<option value="">Select an appointment date</option>' +
      dates.map((date) => `<option value="${formatDateValue(date)}">${formatDateLabel(date)}</option>`).join("")
    : '<option value="">No valid dates available</option>';
  dateSelect.disabled = dates.length === 0;
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
      ? '<option value="">Select a time slot</option>' +
        slots.map((slot) => `<option value="${escapeHtml(slot)}">${escapeHtml(slot)}</option>`).join("")
      : '<option value="">Time slots unavailable</option>';
    timeSelect.disabled = slots.length === 0;
  }

  helper.textContent = `${doctor.name} | Availability: ${formatAvailability(doctor.availability)} | OPD Days: ${doctor.opdDays}`;
}

function prefillDoctorFromQuery() {
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
  populateDateSelect(doctor);
  populateTimeSelect(doctor);

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

  departmentSelect?.addEventListener("change", (event) => {
    populateDoctorSelect(event.target.value);
  });

  doctorSelect?.addEventListener("change", (event) => {
    const doctor = state.doctors.find((entry) => entry.name === event.target.value);
    if (!doctor) {
      return;
    }
    populateDateSelect(doctor);
    populateTimeSelect(doctor);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const selectedDate = String(formData.get("date") || "");
    const selectedTime = String(formData.get("time") || "");
    const selectedDepartment = String(formData.get("department") || "");
    const selectedDoctor = String(formData.get("doctor") || "");
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent || "Submit Appointment";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      await createAppointment({
        name: String(formData.get("name") || "").trim(),
        phone: String(formData.get("phone") || "").trim(),
        date: buildAppointmentDateTime(selectedDate, selectedTime),
        doctor: selectedDoctor,
        message: `Department: ${selectedDepartment} | Preferred Date: ${selectedDate} | Preferred Time: ${selectedTime}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Unable to save appointment to Firestore:", error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }

    const message = [
      "Hello, I want to book an appointment.",
      "",
      `Name: ${formData.get("name")}`,
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
    dateSelect.innerHTML = '<option value="">Select a doctor first</option>';
    dateSelect.disabled = true;
  }
  if (timeSelect) {
    timeSelect.innerHTML = '<option value="">Select a doctor first</option>';
    timeSelect.disabled = true;
  }
}

async function initializeDoctors() {
  renderDoctorListSkeleton();

  const sourceBadge = document.getElementById("doctorDataSource");

  try {
    const { doctors, source } = await loadDoctors();
    const resolvedDoctors = doctors?.length ? doctors : fallbackDoctors;
    state.doctors = resolvedDoctors;
    state.departments = deriveDepartments(resolvedDoctors);
    state.doctorsSource = source;

    updateDoctorCount(resolvedDoctors.length);
    renderDepartments();
    renderDoctors();
    renderGalleryTabs();
    renderDoctorsGallery();
    populateDepartmentSelect();
    setupAppointmentForm();
    prefillDoctorFromQuery();

    if (sourceBadge) {
      sourceBadge.textContent =
        source === "firestore"
          ? "Doctor information is updated from the clinic records."
          : "Doctor information is curated and regularly updated by our clinic team.";
    }
  } catch (error) {
    console.error(error);
    state.doctors = fallbackDoctors;
    state.departments = deriveDepartments(fallbackDoctors);
    state.doctorsSource = "local";
    updateDoctorCount(fallbackDoctors.length);
    renderDepartments();
    renderDoctors();
    renderGalleryTabs();
    renderDoctorsGallery();
    populateDepartmentSelect();
    setupAppointmentForm();
    prefillDoctorFromQuery();

    if (sourceBadge) {
      sourceBadge.textContent = "Doctor information is curated and regularly updated by our clinic team.";
    }
  }
}

renderGallery();
renderTrustIndicators();
renderFacilities();
renderServices();
renderTreatmentPreviews();
renderBlogPreview();
bindDoctorGalleryControls();
setupHeroSectionMenus();
motion = createMotionSystem(document);
motion.refresh();
setupReviewForm();
initializeContent();
initializeReviews();
initializeDoctors();

window.addEventListener("pageshow", () => {
  const params = new URLSearchParams(window.location.search);
  if (!params.get("doctor")) {
    populateDepartmentSelect();
    resetAppointmentSelections();
  }
});
