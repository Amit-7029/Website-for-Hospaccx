import "./styles.css";
import { loadCareerJobs } from "./firebase/careers-store";
import { createMotionSystem } from "./motion";

const motion = createMotionSystem(document);
const jobsGrid = document.getElementById("careerJobsGrid");
const departmentFilter = document.getElementById("careerDepartmentFilter");
const typeFilter = document.getElementById("careerTypeFilter");
const summary = document.getElementById("careerSummary");

const state = {
  jobs: [],
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function filteredJobs() {
  const department = departmentFilter?.value || "all";
  const jobType = typeFilter?.value || "all";

  return state.jobs.filter((job) => {
    const matchesDepartment = department === "all" || job.department === department;
    const matchesType = jobType === "all" || job.jobType === jobType;
    return matchesDepartment && matchesType;
  });
}

function renderFilters() {
  const departments = [...new Set(state.jobs.map((job) => job.department).filter(Boolean))].sort((left, right) => left.localeCompare(right));
  const jobTypes = [...new Set(state.jobs.map((job) => job.jobType).filter(Boolean))];

  if (departmentFilter) {
    departmentFilter.innerHTML = ['<option value="all">All departments</option>', ...departments.map((department) => `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`)].join("");
  }

  if (typeFilter) {
    typeFilter.innerHTML = ['<option value="all">All job types</option>', ...jobTypes.map((jobType) => `<option value="${escapeHtml(jobType)}">${escapeHtml(jobType.replaceAll("-", " "))}</option>`)].join("");
  }
}

function renderJobs() {
  const jobs = filteredJobs();

  if (summary) {
    summary.textContent = jobs.length
      ? `${jobs.length} active opening${jobs.length === 1 ? "" : "s"} available`
      : "No active openings match the selected filters.";
  }

  jobsGrid.innerHTML = jobs.length
    ? jobs
        .map(
          (job) => `
            <article class="career-card" data-motion="fadeUp">
              <div class="career-card__top">
                <span class="career-card__pill">${escapeHtml(job.department)}</span>
                <span class="career-card__status">Active</span>
              </div>
              <h3>${escapeHtml(job.title)}</h3>
              <div class="career-meta">
                <span>${escapeHtml(job.location)}</span>
                <span>${escapeHtml(job.experience)}</span>
                <span>${escapeHtml(job.jobType.replaceAll("-", " "))}</span>
              </div>
              <p>${escapeHtml(job.shortDescription)}</p>
              <a class="button button--secondary career-card__cta" href="/career/${encodeURIComponent(job.id)}">Apply Now</a>
            </article>
          `,
        )
        .join("")
    : `<article class="career-empty"><h3>No openings available</h3><p>We are not actively hiring for the selected filters right now. Please check again later.</p></article>`;

  motion.refresh();
}

async function initializeCareerPage() {
  try {
    state.jobs = await loadCareerJobs();
    renderFilters();
    renderJobs();
  } catch (error) {
    console.error(error);
    jobsGrid.innerHTML = `<article class="career-empty"><h3>Unable to load careers</h3><p>Please refresh the page in a moment.</p></article>`;
  }
}

[departmentFilter, typeFilter].forEach((field) => {
  field?.addEventListener("change", renderJobs);
});

initializeCareerPage();
