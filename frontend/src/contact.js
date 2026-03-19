import "./styles.css";
import { contactDetails } from "./data/content";
import { loadCmsContent } from "./firebase/content-store";
import { createMotionSystem } from "./motion";

const motion = createMotionSystem(document);

const infoList = document.getElementById("contactInfoList");
const actions = document.getElementById("contactActions");
const mapFrame = document.getElementById("contactMapFrame");

async function initializeContactPage() {
  let cmsContent = null;

  try {
    const response = await loadCmsContent();
    cmsContent = response.content;
  } catch (error) {
    console.error(error);
  }

  const phone = cmsContent?.contactPhone || contactDetails.phones[0];
  const email = cmsContent?.contactEmail || contactDetails.emails[0];
  const address = cmsContent?.contactAddress || contactDetails.address;
  const emergencyText = cmsContent?.emergencyText || contactDetails.timings;

  if (infoList) {
    infoList.innerHTML = `
      <article class="info-card">
        <span>Address</span>
        <strong>${address}</strong>
      </article>
      <article class="info-card">
        <span>Phone</span>
        <strong>${phone}</strong>
      </article>
      <article class="info-card">
        <span>Email</span>
        <strong>${email}</strong>
      </article>
      <article class="info-card">
        <span>Social</span>
        <strong>Instagram / Facebook / WhatsApp Community</strong>
        <div class="info-card__socials">
          <a href="${contactDetails.socialLinks.instagram}" target="_blank" rel="noreferrer" class="info-card__social-link" aria-label="Instagram">
            <img src="/images/instagram.jpg" alt="Instagram icon" class="info-card__social-icon">
          </a>
          <a href="${contactDetails.socialLinks.facebook}" target="_blank" rel="noreferrer" class="info-card__social-link" aria-label="Facebook">
            <img src="/images/facebook.png" alt="Facebook icon" class="info-card__social-icon">
          </a>
          <a href="${contactDetails.socialLinks.whatsappGroup}" target="_blank" rel="noreferrer" class="info-card__social-link" aria-label="WhatsApp Group">
            <img src="/images/whatsapp.png" alt="WhatsApp icon" class="info-card__social-icon">
          </a>
        </div>
      </article>
    `;
  }

  if (actions) {
    actions.innerHTML = `
      <a href="${contactDetails.mapLink}" target="_blank" rel="noreferrer" class="button button--secondary">Get Directions</a>
      <a href="/#appointment" class="button button--ghost">Book Appointment</a>
      <div class="contact-timings">
        <strong>Hospital Timings</strong>
        <span>${emergencyText}</span>
      </div>
    `;
  }

  if (mapFrame) {
    mapFrame.src = contactDetails.mapEmbed;
  }

  motion.refresh();
}

initializeContactPage();
