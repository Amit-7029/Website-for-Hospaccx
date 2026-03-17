import "./styles.css";
import { treatments } from "./data/content";

document.getElementById("treatmentDetailStack").innerHTML = treatments
  .map(
    (item) => `
      <article class="detail-card" id="${item.slug}">
        <p class="eyebrow">Treatment Page</p>
        <h2>${item.title}</h2>
        <p class="detail-card__summary">${item.summary}</p>
        <div class="detail-card__grid">
          <section>
            <h3>Symptoms</h3>
            <ul>${item.symptoms.map((entry) => `<li>${entry}</li>`).join("")}</ul>
          </section>
          <section>
            <h3>Causes</h3>
            <ul>${item.causes.map((entry) => `<li>${entry}</li>`).join("")}</ul>
          </section>
          <section>
            <h3>Treatment Options</h3>
            <ul>${item.treatmentOptions.map((entry) => `<li>${entry}</li>`).join("")}</ul>
          </section>
          <section>
            <h3>When to Visit Doctor</h3>
            <p>${item.whenToVisit}</p>
          </section>
        </div>
      </article>
    `
  )
  .join("");
