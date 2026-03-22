function sanitizeText(value) {
  return String(value || "").trim();
}

async function readJson(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to process request");
  }

  return payload;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read resume"));
    reader.readAsDataURL(file);
  });
}

export async function loadCareerJobs(filters = {}) {
  const params = new URLSearchParams();
  if (filters.department) {
    params.set("department", sanitizeText(filters.department));
  }
  if (filters.jobType) {
    params.set("jobType", sanitizeText(filters.jobType));
  }

  const response = await fetch(`/api/careers/jobs${params.toString() ? `?${params}` : ""}`, {
    cache: "no-store",
  });

  const payload = await readJson(response);
  return payload.jobs || [];
}

export async function loadCareerJob(id) {
  const response = await fetch(`/api/careers/job?id=${encodeURIComponent(sanitizeText(id))}`, {
    cache: "no-store",
  });

  const payload = await readJson(response);
  return payload.job;
}

export async function submitCareerApplication({ jobId, name, email, phone, resumeFile, message }) {
  if (!(resumeFile instanceof File)) {
    throw new Error("Resume file is required");
  }

  if (resumeFile.type !== "application/pdf") {
    throw new Error("Resume must be a PDF file");
  }

  const resumeDataUrl = await fileToDataUrl(resumeFile);
  const response = await fetch("/api/careers/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jobId,
      name,
      email,
      phone,
      message,
      resumeName: resumeFile.name,
      resumeDataUrl,
    }),
  });

  return readJson(response);
}
