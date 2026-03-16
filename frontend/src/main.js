import "./styles.css";
import { departments, doctors } from "./data/doctors";
import { galleryItems } from "./data/gallery";

const DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY"
];

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
          <div class="doctor-card__header">
            <span class="doctor-card__avatar" aria-hidden="true">
              <img
                src="${doctor.gender === "female" ? "/images/doctor-female.jpeg" : "/images/doctor-male.jpeg"}"
                alt=""
                class="doctor-card__avatar-image">
            </span>
            <div>
              <p class="doctor-card__department">${doctor.department}</p>
              <h3>${doctor.name}</h3>
            </div>
          </div>
          <p class="doctor-card__qualification">${doctor.qualification}</p>
          <ul class="doctor-card__meta">
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
          <figcaption>
            <span>${item.caption}</span>
            ${item.link ? `<a class="gallery-card__link" href="${item.link}" target="_blank" rel="noreferrer">Open location</a>` : ""}
          </figcaption>
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

function populateDoctorSelect(department) {
  const doctorSelect = document.getElementById("doctor");
  const timeSelect = document.getElementById("time");
  const helper = document.getElementById("doctorScheduleHelper");

  if (!doctorSelect || !timeSelect || !helper) {
    return;
  }

  const matchingDoctors = doctors.filter((doctor) => doctor.department === department);

  doctorSelect.innerHTML = matchingDoctors.length
    ? '<option value="">Select a doctor</option>' +
      matchingDoctors
        .map(
          (doctor) =>
            `<option value="${doctor.name}">${doctor.name}</option>`
        )
        .join("")
    : '<option value="">Select a department first</option>';

  doctorSelect.disabled = matchingDoctors.length === 0;
  timeSelect.innerHTML = '<option value="">Select a doctor first</option>';
  timeSelect.disabled = true;
  helper.textContent = matchingDoctors.length
    ? "Select a doctor to see the available appointment slots."
    : "Select a department to choose from the available doctors.";
}

function normalizeDayList(opdDays) {
  const text = opdDays.toUpperCase();
  if (text.includes("EVERYDAY") || text.includes("EVERY DAY") || text === "-") {
    return { days: DAYS, strict: false };
  }

  const matchedDays = DAYS.filter((day) => text.includes(day));
  const strict = matchedDays.length > 0 && !text.includes("FIRST") && !text.includes("LAST") && !text.includes("MONTH");
  return { days: matchedDays, strict };
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

function populateTimeSelect(doctorName) {
  const timeSelect = document.getElementById("time");
  const helper = document.getElementById("doctorScheduleHelper");
  if (!timeSelect || !helper) {
    return;
  }

  const doctor = doctors.find((entry) => entry.name === doctorName);
  if (!doctor) {
    timeSelect.innerHTML = '<option value="">Select a doctor first</option>';
    timeSelect.disabled = true;
    helper.textContent = "Select a doctor to view available timing and OPD days.";
    return;
  }

  const ranges = extractTimeRanges(doctor.timing);
  const { days } = normalizeDayList(doctor.opdDays);

  if (doctor.timing.toUpperCase().includes("BY APPOINTMENT")) {
    timeSelect.innerHTML = '<option value="By Appointment">By Appointment</option>';
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
        slots.map((slot) => `<option value="${slot}">${slot}</option>`).join("")
      : '<option value="">Time slots unavailable</option>';
    timeSelect.disabled = slots.length === 0;
  }

  const opdLine = doctor.opdDays === "-" ? "Available by prior appointment." : `OPD Days: ${doctor.opdDays}`;
  const timeLine = doctor.timing.toUpperCase().includes("BY APPOINTMENT")
    ? "Timing: By appointment"
    : `Timing: ${doctor.timing}`;

  helper.textContent = `${doctor.name} | ${timeLine} | ${opdLine}`;

  const dateInput = document.getElementById("date");
  if (dateInput && dateInput.value) {
    validateDoctorDate(doctor, dateInput);
  }
}

function validateDoctorDate(doctor, dateInput) {
  const { days, strict } = normalizeDayList(doctor.opdDays);
  if (!dateInput.value || !strict) {
    dateInput.setCustomValidity("");
    return;
  }

  const selectedDate = new Date(`${dateInput.value}T00:00:00`);
  const selectedDay = DAYS[selectedDate.getDay()];
  if (days.includes(selectedDay)) {
    dateInput.setCustomValidity("");
    return;
  }

  dateInput.setCustomValidity(`Please select a ${doctor.opdDays} appointment date for ${doctor.name}.`);
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

  const departmentSelect = document.getElementById("department");
  const doctorSelect = document.getElementById("doctor");
  const dateInput = document.getElementById("date");

  if (departmentSelect) {
    departmentSelect.addEventListener("change", (event) => {
      populateDoctorSelect(event.target.value);
    });
  }

  if (doctorSelect) {
    doctorSelect.addEventListener("change", (event) => {
      populateTimeSelect(event.target.value);
    });
  }

  if (dateInput) {
    dateInput.addEventListener("change", () => {
      const doctor = doctors.find((entry) => entry.name === doctorSelect?.value);
      if (doctor) {
        validateDoctorDate(doctor, dateInput);
      } else {
        dateInput.setCustomValidity("");
      }
      dateInput.reportValidity();
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const selectedDoctor = doctors.find((doctor) => doctor.name === formData.get("doctor"));
    if (selectedDoctor && dateInput) {
      validateDoctorDate(selectedDoctor, dateInput);
      if (!form.reportValidity()) {
        return;
      }
    }

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
