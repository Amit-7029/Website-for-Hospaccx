import "./styles.css";
import { galleryItems } from "./data/gallery";
import { closeAnimatedLayer, createMotionSystem, openAnimatedLayer } from "./motion";

const motion = createMotionSystem(document);

const gallery = document.getElementById("fullGalleryGrid");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

gallery.innerHTML = galleryItems
  .map(
    (item) => `
      <figure class="gallery-card${item.large ? " gallery-card--large" : ""}">
        <button class="gallery-card__button" type="button" data-src="${item.src}" data-alt="${item.alt}">
          <img src="${item.src}" alt="${item.alt}">
        </button>
        <figcaption>${item.caption}</figcaption>
      </figure>
    `
  )
  .join("");

motion.refresh();

gallery.addEventListener("click", (event) => {
  const button = event.target.closest(".gallery-card__button");
  if (!button) {
    return;
  }

  lightboxImage.src = button.dataset.src;
  lightboxImage.alt = button.dataset.alt;
  openAnimatedLayer(lightbox);
});

lightboxClose.addEventListener("click", () => {
  closeAnimatedLayer(lightbox);
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeAnimatedLayer(lightbox);
  }
});
