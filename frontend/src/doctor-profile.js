import "./styles.css";
import { doctors } from "./data/doctors";

const params = new URLSearchParams(window.location.search);
const doctorName = params.get("doctor");
const doctor = doctors.find((entry) => entry.name === doctorName) ?? doctors[0];

document.getElementById("doctorProfileTitle").textContent = doctor.name;
document.getElementById("doctorProfileSubtitle").textContent =
  `${doctor.department} consultation profile, timing, qualification, and booking access.`;

document.getElementById("doctorProfileCard").innerHTML = `
  <article class="profile-card">
    <div class="profile-card__media">
      <img
        src="${doctor.gender === "female" ? "/images/doctor-female.jpeg" : "/images/doctor-male.jpeg"}"
        alt="${doctor.name}"
        class="profile-card__image">
    </div>
    <div class="profile-card__body">
      <p class="doctor-card__department">${doctor.department}</p>
      <h2>${doctor.name}</h2>
      <p class="doctor-card__qualification">${doctor.qualification}</p>
      <div class="profile-card__meta">
        <article>
          <span>Specialization</span>
          <strong>${doctor.department}</strong>
        </article>
        <article>
          <span>Experience</span>
          <strong>Experienced specialist consultant</strong>
        </article>
        <article>
          <span>Consultation Timing</span>
          <strong>${doctor.timing}</strong>
        </article>
        <article>
          <span>OPD Days</span>
          <strong>${doctor.opdDays}</strong>
        </article>
      </div>
      <div class="card-actions">
        <a href="/?doctor=${encodeURIComponent(doctor.name)}#appointment" class="button button--secondary">Book Appointment</a>
        <a href="/#doctors" class="doctor-card__action">Back to Doctors</a>
      </div>
    </div>
  </article>
`;
