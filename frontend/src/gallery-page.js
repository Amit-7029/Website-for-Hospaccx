import "./styles.css";
import { MEDIA_IMAGE_FALLBACK } from "./data/media";
import { loadMediaItems } from "./firebase/media-store";
import { closeAnimatedLayer, createMotionSystem, openAnimatedLayer } from "./motion";

const motion = createMotionSystem(document);
const gallery = document.getElementById("fullGalleryGrid");
const tabs = document.getElementById("galleryCategoryTabs");
const summary = document.getElementById("galleryPageSummary");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

const state = {
  items: [],
  category: "All",
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function imageMarkup(src, alt) {
  return `<img src="${escapeHtml(src || MEDIA_IMAGE_FALLBACK)}" alt="${escapeHtml(alt || "Hospaccx gallery image")}" onerror="this.onerror=null;this.src='${MEDIA_IMAGE_FALLBACK}'">`;
}

function filteredItems() {
  return state.items.filter((item) => (state.category === "All" ? true : item.category === state.category));
}

function renderTabs() {
  if (!tabs) {
    return;
  }

  const categories = ["All", ...new Set(state.items.map((item) => item.category).filter(Boolean))];
  tabs.innerHTML = categories
    .map(
      (category) =>
        `<button type="button" class="filter-chip${category === state.category ? " filter-chip--active" : ""}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`,
    )
    .join("");

  tabs.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category || "All";
      renderTabs();
      renderGallery();
    });
  });
}

function renderGallery() {
  const items = filteredItems();

  if (summary) {
    summary.textContent = items.length
      ? `${items.length} gallery image${items.length === 1 ? "" : "s"} in ${state.category === "All" ? "all categories" : state.category}`
      : "No gallery images available for the selected category.";
  }

  gallery.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <figure class="gallery-card" data-motion="fadeUp">
              <button class="gallery-card__button" type="button" data-src="${escapeHtml(item.imageUrl)}" data-alt="${escapeHtml(item.alt || item.title)}">
                ${imageMarkup(item.imageUrl, item.alt || item.title)}
              </button>
              <figcaption>
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.caption)}</span>
              </figcaption>
            </figure>
          `,
        )
        .join("")
    : `<article class="state-card"><h3>No gallery images</h3><p>Add media in the admin panel to populate this page.</p></article>`;

  gallery.querySelectorAll("[data-src]").forEach((button) => {
    button.addEventListener("click", () => {
      lightboxImage.src = button.dataset.src || MEDIA_IMAGE_FALLBACK;
      lightboxImage.alt = button.dataset.alt || "Hospaccx gallery image";
      openAnimatedLayer(lightbox);
    });
  });

  motion.refresh();
}

async function initializeGalleryPage() {
  try {
    const { items } = await loadMediaItems();
    state.items = items.filter((item) => item.section === "gallery");
    renderTabs();
    renderGallery();
  } catch (error) {
    console.error(error);
    state.items = [];
    renderTabs();
    renderGallery();
  }
}

lightboxClose.addEventListener("click", () => {
  closeAnimatedLayer(lightbox);
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeAnimatedLayer(lightbox);
  }
});

initializeGalleryPage();
