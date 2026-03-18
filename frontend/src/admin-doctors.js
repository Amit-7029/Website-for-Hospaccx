import "./styles.css";
import { createDoctor, editDoctor, loadDoctors, removeDoctor, uploadDoctorImage } from "./firebase/doctors-store";
import { isFirebaseConfigured } from "./firebase/client";

const form = document.getElementById("doctorAdminForm");
const list = document.getElementById("doctorAdminList");
const statusNote = document.getElementById("adminStatusNote");
const modeLabel = document.getElementById("adminModeLabel");
const resetButton = document.getElementById("doctorFormReset");

let doctors = [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setModeLabel(text) {
  if (modeLabel) {
    modeLabel.textContent = text;
  }
}

function setStatus(text, isError = false) {
  if (!statusNote) {
    return;
  }

  statusNote.textContent = text;
  statusNote.style.color = isError ? "#d6336c" : "";
}

function parseAvailability(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, from] = line.split("|").map((part) => part.trim());
      return { day, from };
    })
    .filter((entry) => entry.day && entry.from);
}

function parseServices(value) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function resetForm() {
  form?.reset();
  const doctorId = document.getElementById("doctorId");
  if (doctorId) {
    doctorId.value = "";
  }
  setModeLabel("Ready to create a doctor entry.");
}

function fillForm(doctor) {
  document.getElementById("doctorId").value = doctor.id;
  document.getElementById("doctorName").value = doctor.name;
  document.getElementById("doctorDepartment").value = doctor.department;
  document.getElementById("doctorSpecialization").value = doctor.specialization;
  document.getElementById("doctorQualification").value = doctor.qualification;
  document.getElementById("doctorTiming").value = doctor.timing;
  document.getElementById("doctorOpdDays").value = doctor.opdDays;
  document.getElementById("doctorGender").value = doctor.gender;
  document.getElementById("doctorImageUrl").value = doctor.image || "";
  document.getElementById("doctorAvailability").value = (doctor.availability || [])
    .map((slot) => `${slot.day}|${slot.from}`)
    .join("\n");
  document.getElementById("doctorServices").value = (doctor.services || []).join("\n");
  setModeLabel(`Editing ${doctor.name}`);
}

function renderDoctorAdminList() {
  if (!list) {
    return;
  }

  list.innerHTML = doctors.length
    ? doctors
        .map(
          (doctor) => `
            <article class="doctor-card admin-doctor-card">
              <div class="doctor-card__header">
                <span class="doctor-card__avatar" aria-hidden="true">
                  <img src="${doctor.image}" alt="" class="doctor-card__avatar-image" loading="lazy">
                </span>
                <div>
                  <p class="doctor-card__department">${escapeHtml(doctor.department)}</p>
                  <h3>${escapeHtml(doctor.name)}</h3>
                </div>
              </div>
              <p class="doctor-card__qualification">${escapeHtml(doctor.qualification)}</p>
              <p class="doctor-card__specialization">${escapeHtml(doctor.specialization)}</p>
              <div class="card-actions">
                <button type="button" class="button button--secondary" data-edit-doctor="${escapeHtml(doctor.id)}">Edit</button>
                <button type="button" class="button button--ghost" data-delete-doctor="${escapeHtml(doctor.id)}">Delete</button>
              </div>
            </article>
          `
        )
        .join("")
    : '<article class="state-card"><h3>No doctors found</h3><p>Doctor records will appear here after they are loaded.</p></article>';

  list.querySelectorAll("[data-edit-doctor]").forEach((button) => {
    button.addEventListener("click", () => {
      const doctor = doctors.find((entry) => entry.id === button.dataset.editDoctor);
      if (doctor) {
        fillForm(doctor);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  list.querySelectorAll("[data-delete-doctor]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (!isFirebaseConfigured()) {
        setStatus("Firebase is not configured, so delete is disabled in this environment.", true);
        return;
      }

      const doctorId = button.dataset.deleteDoctor;
      const doctor = doctors.find((entry) => entry.id === doctorId);
      if (!doctor || !window.confirm(`Delete ${doctor.name}?`)) {
        return;
      }

      try {
        await removeDoctor(doctorId);
        setStatus(`${doctor.name} was deleted successfully.`);
        await refreshDoctors();
      } catch (error) {
        console.error(error);
        setStatus(error.message || "Could not delete the doctor right now.", true);
      }
    });
  });
}

async function refreshDoctors() {
  list.innerHTML = Array.from({ length: 4 }, () => '<article class="doctor-card doctor-card--skeleton"></article>').join("");
  const result = await loadDoctors();
  doctors = result.doctors;
  renderDoctorAdminList();

  if (isFirebaseConfigured()) {
    setStatus(`Connected to ${result.source === "firestore" ? "Firestore" : "local data"}. Doctor changes will persist to Firebase.`);
  } else {
    setStatus("Firebase is not configured yet. This page shows the current website dataset but save/delete actions require Firebase settings.", true);
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) {
    return;
  }

  if (!isFirebaseConfigured()) {
    setStatus("Firebase is not configured. Add VITE_FIREBASE_* variables before saving doctor records.", true);
    return;
  }

  const formData = new FormData(form);
  const doctorId = formData.get("doctorId");
  let image = formData.get("doctorImageUrl")?.toString().trim();

  try {
    const file = formData.get("doctorImageFile");
    if (file instanceof File && file.size > 0) {
      image = await uploadDoctorImage(file, doctorId || formData.get("doctorName").toString().trim());
    }

    const payload = {
      name: formData.get("doctorName").toString().trim(),
      department: formData.get("doctorDepartment").toString().trim().toUpperCase(),
      specialization: formData.get("doctorSpecialization").toString().trim(),
      qualification: formData.get("doctorQualification").toString().trim(),
      timing: formData.get("doctorTiming").toString().trim(),
      opdDays: formData.get("doctorOpdDays").toString().trim().toUpperCase(),
      gender: formData.get("doctorGender").toString(),
      image: image || "",
      availability: parseAvailability(formData.get("doctorAvailability").toString()),
      services: parseServices(formData.get("doctorServices").toString())
    };

    if (doctorId) {
      await editDoctor(doctorId.toString(), payload);
      setStatus(`${payload.name} was updated successfully.`);
    } else {
      await createDoctor(payload);
      setStatus(`${payload.name} was added successfully.`);
    }

    resetForm();
    await refreshDoctors();
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Could not save the doctor right now.", true);
  }
});

resetButton?.addEventListener("click", resetForm);

refreshDoctors();
