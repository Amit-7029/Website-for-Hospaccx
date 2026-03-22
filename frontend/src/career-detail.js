import "./styles.css";
import { loadCareerJob, submitCareerApplication } from "./firebase/careers-store";
import { createMotionSystem } from "./motion";

const motion = createMotionSystem(document);
const title = document.getElementById("careerDetailTitle");
const subtitle = document.getElementById("careerDetailSubtitle");
const meta = document.getElementById("careerDetailMeta");
const description = document.getElementById("careerDetailDescription");
const requirements = document.getElementById("careerRequirements");
const form = document.getElementById("careerApplicationForm");
const message = document.getElementById("careerApplyMessage");
const submitButton = document.getElementById("careerApplySubmit");

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resolveCareerId() {
  const searchId = new URLSearchParams(window.location.search).get("id");
  if (searchId) {
    return searchId;
  }

  const parts = window.location.pathname.split("/").filter(Boolean);
  const lastPart = parts[parts.length - 1];
  if (lastPart && lastPart !== "career" && !lastPart.endsWith(".html")) {
    return lastPart;
  }

  return "";
}

function setMessage(text, type = "neutral") {
  if (!message) {
    return;
  }

  message.textContent = text;
  message.dataset.state = type;
}

async function initializeCareerDetail() {
  const jobId = resolveCareerId();
  if (!jobId) {
    setMessage("Job opening not found.", "error");
    return;
  }

  try {
    const job = await loadCareerJob(jobId);
    title.textContent = job.title;
    subtitle.textContent = job.shortDescription;
    meta.innerHTML = `
      <span>${escapeHtml(job.department)}</span>
      <span>${escapeHtml(job.location)}</span>
      <span>${escapeHtml(job.experience)}</span>
      <span>${escapeHtml(job.jobType.replaceAll("-", " "))}</span>
    `;
    description.textContent = job.description;
    requirements.innerHTML = job.requirements.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const resumeFile = formData.get("resume");

      if (!(resumeFile instanceof File) || !resumeFile.size) {
        setMessage("Please attach your resume in PDF format.", "error");
        return;
      }

      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
      setMessage("Submitting your application...", "neutral");

      try {
        await submitCareerApplication({
          jobId,
          name: String(formData.get("name") || "").trim(),
          email: String(formData.get("email") || "").trim(),
          phone: String(formData.get("phone") || "").trim(),
          message: String(formData.get("message") || "").trim(),
          resumeFile,
        });

        form.reset();
        setMessage("Application submitted successfully. Our team will review your profile shortly.", "success");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to submit application", "error");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Application";
      }
    });

    motion.refresh();
  } catch (error) {
    console.error(error);
    setMessage("This role is no longer available.", "error");
  }
}

initializeCareerDetail();
