import "./styles.css";
import { insuranceSupport } from "./data/content";

document.getElementById("insuranceDetailStack").innerHTML = insuranceSupport
  .map(
    (item) => `
      <article class="detail-card">
        <p class="eyebrow">Patient Support</p>
        <h2>${item.title}</h2>
        <p class="detail-card__summary">${item.description}</p>
        <div class="detail-card__grid">
          <section>
            <h3>How We Help</h3>
            <p>Our front-desk and care coordination team can guide patients through available process steps, documentation expectations, and treatment communication support.</p>
          </section>
          <section>
            <h3>Recommended Next Step</h3>
            <p>Contact the hospital team before your visit so the required records and treatment workflow can be reviewed in advance.</p>
          </section>
        </div>
      </article>
    `
  )
  .join("");
