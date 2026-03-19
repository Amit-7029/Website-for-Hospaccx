import "./styles.css";
import { loadDiagnosticServices } from "./firebase/content-store";
import { createMotionSystem } from "./motion";

const motion = createMotionSystem(document);

const container = document.getElementById("servicesPageGrid");

async function initializeServicesPage() {
  if (!container) {
    return;
  }

  try {
    const { services } = await loadDiagnosticServices();
    container.innerHTML = services
      .map(
        (service) => `
          <article class="service-card">
            <span class="service-card__icon" aria-hidden="true">${service.icon}</span>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
          </article>
        `
      )
      .join("");
  } catch (error) {
    console.error(error);
  }

  motion.refresh();
}

initializeServicesPage();
