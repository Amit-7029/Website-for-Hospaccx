import "./styles.css";
import { diagnosticServices } from "./data/content";
import { createMotionSystem } from "./motion";

const motion = createMotionSystem(document);

const container = document.getElementById("servicesPageGrid");

if (container) {
  container.innerHTML = diagnosticServices
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
}

motion.refresh();
