import "./styles.css";
import { loadDoctors } from "./firebase/doctors-store";
import { createMotionSystem } from "./motion";

const motion = createMotionSystem(document);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function doctorAvatar(doctor) {
  return doctor.image || (doctor.gender === "female" ? "/images/doctor-female.jpeg" : "/images/doctor-male.jpeg");
}

function formatAvailability(availability = []) {
  return availability.map((slot) => `${slot.day}: ${slot.from}`).join(" | ");
}

async function renderDoctorProfile() {
  const params = new URLSearchParams(window.location.search);
  const doctorName = params.get("doctor");

  try {
    const { doctors } = await loadDoctors();
    const doctor = doctors.find((entry) => entry.name === doctorName) ?? doctors[0];

    document.getElementById("doctorProfileTitle").textContent = doctor.name;
    document.getElementById("doctorProfileSubtitle").textContent =
      `${doctor.specialization} consultation profile, timing, qualification, and booking access.`;

    document.getElementById("doctorProfileCard").innerHTML = `
      <article class="profile-card">
        <div class="profile-card__media">
          <img src="${doctorAvatar(doctor)}" alt="${escapeHtml(doctor.name)}" class="profile-card__image">
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
              <span>Consultation Timing</span>
              <strong>${escapeHtml(doctor.timing)}</strong>
            </article>
            <article>
              <span>OPD Days</span>
              <strong>${escapeHtml(doctor.opdDays)}</strong>
            </article>
            <article>
              <span>Services</span>
              <strong>${escapeHtml(doctor.services.join(", "))}</strong>
            </article>
          </div>
          <div class="card-actions">
            <a href="/?doctor=${encodeURIComponent(doctor.name)}#appointment" class="button button--secondary">Book Appointment</a>
            <a href="/#doctor-gallery" class="doctor-card__action">Back to Doctors</a>
          </div>
        </div>
      </article>
    `;
    motion.refresh();
  } catch (error) {
    console.error(error);
    document.getElementById("doctorProfileTitle").textContent = "Doctor profile unavailable";
    document.getElementById("doctorProfileSubtitle").textContent = "Please return to the homepage and try again.";
    document.getElementById("doctorProfileCard").innerHTML =
      '<article class="state-card state-card--error"><h3>Could not load the doctor profile</h3><p>Please try again later or contact the clinic directly.</p></article>';
    motion.refresh();
  }
}

renderDoctorProfile();
