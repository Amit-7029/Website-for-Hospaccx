import "./styles.css";
import { galleryItems } from "./data/gallery";
import { blogPosts, facilities, testimonials, treatments, trustIndicators } from "./data/content";
import { loadDoctors } from "./firebase/doctors-store";

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
  doctorsSource: "local"
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatAvailability(availability = []) {
  return availability
    .map((slot) => `${slot.day}: ${slot.from}`)
    .join(" | ");
}

function doctorAvatar(doctor) {
  return doctor.image || (doctor.gender === "female" ? "/images/doctor-female.jpeg" : "/images/doctor-male.jpeg");
}

function doctorGalleryImage(doctor) {
  return doctor.posterImage || doctorAvatar(doctor);
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
          <p>Specialist consultation and OPD support available under this department.</p>
        </article>
      `
    )
    .join("");
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
}

function renderTestimonials() {
  const track = document.getElementById("testimonialTrack");
  if (!track) {
    return;
  }

  track.innerHTML = testimonials
    .map(
      (item) => `
        <article class="testimonial-slide">
          <div class="testimonial-slide__stars">${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)}</div>
          <p>${escapeHtml(item.feedback)}</p>
          <strong>${escapeHtml(item.name)}</strong>
        </article>
      `
    )
    .join("");

  const previousButton = document.getElementById("testimonialPrev");
  const nextButton = document.getElementById("testimonialNext");

  previousButton?.addEventListener("click", () => {
    track.scrollBy({ left: -360, behavior: "smooth" });
  });

  nextButton?.addEventListener("click", () => {
    track.scrollBy({ left: 360, behavior: "smooth" });
  });
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

  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function openDoctorPosterPreview(doctorId) {
  const modal = document.getElementById("doctorModal");
  const body = document.getElementById("doctorModalBody");
  const doctor = state.doctors.find((entry) => entry.id === doctorId);

  if (!modal || !body || !doctor) {
    return;
  }

  body.innerHTML = `
    <article class="poster-only-card">
      <img src="${doctorGalleryImage(doctor)}" alt="${escapeHtml(doctor.name)}" class="poster-only-card__image">
    </article>
  `;

  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeDoctorModal() {
  const modal = document.getElementById("doctorModal");
  if (!modal) {
    return;
  }

  modal.hidden = true;
  document.body.classList.remove("modal-open");
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

function populateDepartmentSelect() {
  const select = document.getElementById("department");
  if (!select) {
    return;
  }

  select.innerHTML =
    '<option value="">Select a department</option>' +
    state.departments.map((department) => `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`).join("");
}

function populateDoctorSelect(department) {
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

  doctorSelect.disabled = matchingDoctors.length === 0;
  dateSelect.innerHTML = '<option value="">Select a doctor first</option>';
  dateSelect.disabled = true;
  timeSelect.innerHTML = '<option value="">Select a doctor first</option>';
  timeSelect.disabled = true;
  helper.textContent = matchingDoctors.length
    ? "Select a doctor to see the available appointment slots."
    : "Select a department to choose from the available doctors.";
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
    return;
  }

  const doctor = state.doctors.find((entry) => entry.name === doctorName);
  const departmentSelect = document.getElementById("department");
  const doctorSelect = document.getElementById("doctor");

  if (!doctor || !departmentSelect || !doctorSelect) {
    return;
  }

  departmentSelect.value = doctor.department;
  populateDoctorSelect(doctor.department);
  doctorSelect.value = doctor.name;
  populateDateSelect(doctor);
  populateTimeSelect(doctor);
}

function setupAppointmentForm() {
  const form = document.getElementById("whatsappAppointmentForm");
  if (!form) {
    return;
  }

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

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const message = [
      "Hello, I want to book an appointment.",
      "",
      `Name: ${formData.get("name")}`,
      `Phone: ${formData.get("phone")}`,
      `Department: ${formData.get("department")}`,
      `Doctor: ${formData.get("doctor")}`,
      `Preferred Date: ${formData.get("date")}`,
      `Preferred Time: ${formData.get("time")}`
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
    state.doctors = doctors;
    state.departments = [...new Set(doctors.map((doctor) => doctor.department))].sort();
    state.doctorsSource = source;

    updateDoctorCount(doctors.length);
    renderDepartments();
    renderDoctors();
    renderGalleryTabs();
    renderDoctorsGallery();
    populateDepartmentSelect();
    setupInitialFormState();
    setupAppointmentForm();
    prefillDoctorFromQuery();

    if (sourceBadge) {
      sourceBadge.textContent =
        source === "firestore"
          ? "Doctors data is loading from the live clinic database."
          : "Doctors data is currently using the local website dataset.";
    }
  } catch (error) {
    console.error(error);
    renderDoctorError(error.message || "Please try again later.");
  }
}

renderGallery();
renderTrustIndicators();
renderFacilities();
renderTreatmentPreviews();
renderBlogPreview();
renderTestimonials();
bindDoctorGalleryControls();
initializeDoctors();
