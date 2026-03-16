import "./styles.css";
import { departments, doctors } from "./data/doctors";
import { galleryItems } from "./data/gallery";

function renderDepartments() {
  const container = document.getElementById("departmentGrid");
  if (!container) {
    return;
  }

  container.innerHTML = departments
    .map(
      (department, index) => `
        <article class="department-card">
          <span class="department-card__index">${String(index + 1).padStart(2, "0")}</span>
          <h3>${department}</h3>
          <p>Specialist consultation and OPD support available under this department.</p>
        </article>
      `
    )
    .join("");
}

function renderDoctors() {
  const container = document.getElementById("doctorGrid");
  const doctorCount = document.getElementById("doctorCount");

  if (doctorCount) {
    doctorCount.textContent = String(doctors.length);
  }

  if (!container) {
    return;
  }

  container.innerHTML = doctors
    .map(
      (doctor) => `
        <article class="doctor-card">
          <p class="doctor-card__department">${doctor.department}</p>
          <h3>${doctor.name}</h3>
          <p class="doctor-card__qualification">${doctor.qualification}</p>
          <ul class="doctor-card__meta">
            <li><strong>Fees:</strong> INR ${doctor.charges}</li>
            <li><strong>Timing:</strong> ${doctor.timing}</li>
            <li><strong>OPD Days:</strong> ${doctor.opdDays}</li>
          </ul>
          <a href="#appointment" class="doctor-card__action">Book Appointment</a>
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
          <img src="${item.src}" alt="${item.alt}">
          <figcaption>${item.caption}</figcaption>
        </figure>
      `
    )
    .join("");
}

function populateDepartmentSelect() {
  const select = document.getElementById("department");
  if (!select) {
    return;
  }

  select.insertAdjacentHTML(
    "beforeend",
    departments
      .map((department) => `<option value="${department}">${department}</option>`)
      .join("")
  );
}

function setMinimumDate() {
  const dateInput = document.getElementById("date");
  if (!dateInput) {
    return;
  }

  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
  dateInput.min = localDate;
}

function setupAppointmentForm() {
  const form = document.getElementById("whatsappAppointmentForm");
  if (!form) {
    return;
  }

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
      `Email: ${formData.get("email")}`,
      `Phone: ${formData.get("phone")}`,
      `Department: ${formData.get("department")}`,
      `Preferred Date: ${formData.get("date")}`,
      `Preferred Time: ${formData.get("time")}`
    ].join("\n");

    window.location.href =
      "https://wa.me/917384251751?text=" + encodeURIComponent(message);
  });
}

renderDepartments();
renderDoctors();
renderGallery();
populateDepartmentSelect();
setMinimumDate();
setupAppointmentForm();
