export const motionVariants = {
  fadeUp: { x: 0, y: 34, scale: 1, duration: 760 },
  fadeIn: { x: 0, y: 0, scale: 1, duration: 620 },
  slideLeft: { x: -42, y: 0, scale: 1, duration: 760 },
  slideRight: { x: 42, y: 0, scale: 1, duration: 760 },
  staggerContainer: { x: 0, y: 0, scale: 1, duration: 680 }
};

const layerTimers = new WeakMap();

function setMotion(el, variant = "fadeUp", options = {}) {
  if (!el) {
    return;
  }

  const definition = motionVariants[variant] ?? motionVariants.fadeUp;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const compactMotion = window.matchMedia("(max-width: 720px)").matches;
  const factor = compactMotion ? 0.72 : 1;
  const x = (options.x ?? definition.x) * factor;
  const y = (options.y ?? definition.y) * factor;
  const duration = Math.round((options.duration ?? definition.duration) * (compactMotion ? 0.92 : 1));

  el.dataset.motion = variant;
  el.style.setProperty("--motion-x", `${x}px`);
  el.style.setProperty("--motion-y", `${y}px`);
  el.style.setProperty("--motion-scale", String(options.scale ?? definition.scale ?? 1));
  el.style.setProperty("--motion-delay", `${options.delay ?? 0}ms`);
  el.style.setProperty("--motion-duration", `${duration}ms`);

  if (reduceMotion) {
    el.classList.add("is-inview");
  }
}

function sequence(elements, variant = "fadeUp", baseDelay = 0, step = 80) {
  Array.from(elements).forEach((element, index) => {
    setMotion(element, variant, { delay: baseDelay + index * step });
  });
}

function splitHeroHeading(root) {
  const heading = root.querySelector(".hero__copy h1");
  if (!heading || heading.dataset.motionSplit === "true") {
    return;
  }

  const text = heading.textContent.trim().replace(/\s+/g, " ");
  heading.dataset.motionSplit = "true";
  heading.setAttribute("aria-label", text);
  heading.classList.add("motion-heading");
  heading.innerHTML = text
    .split(" ")
    .map(
      (word, index, array) =>
        `<span class="hero-title-word" style="--word-delay:${index * 70}ms">${word}${index < array.length - 1 ? "&nbsp;" : ""}</span>`
    )
    .join("");
}

function decorateHero(root) {
  splitHeroHeading(root);

  setMotion(root.querySelector(".hero__copy .eyebrow"), "fadeIn", { delay: 40 });
  setMotion(root.querySelector(".hero__copy h1"), "fadeIn", { delay: 80 });
  setMotion(root.querySelector(".hero__copy .subtitle"), "fadeUp", { delay: 180 });
  setMotion(root.querySelector(".hero__actions--compact"), "slideLeft", { delay: 260 });
  sequence(root.querySelectorAll(".hero__stats article"), "fadeUp", 320, 90);
  setMotion(root.querySelector(".hero__panel"), "slideRight", { delay: 180 });

  const floatingPanel = root.querySelector(".hero__panel");
  if (floatingPanel) {
    floatingPanel.classList.add("motion-float");
  }
}

function decorateStaticSections(root) {
  root.querySelectorAll(".section > .container").forEach((container, index) => {
    setMotion(container, "fadeUp", { delay: Math.min(index * 35, 180), duration: 820 });
  });

  root.querySelectorAll(".section__heading, .page-hero .container").forEach((element, index) => {
    setMotion(element, "fadeUp", { delay: Math.min(index * 25, 140) });
  });

  root.querySelectorAll(".about-grid, .appointment-layout, .contact-layout").forEach((grid) => {
    const children = Array.from(grid.children);
    if (children[0]) {
      setMotion(children[0], "slideLeft", { delay: 80 });
    }
    if (children[1]) {
      setMotion(children[1], "slideRight", { delay: 160 });
    }
  });

  [
    [".department-grid", ".department-card", "fadeUp"],
    [".service-grid", ".service-card", "fadeUp"],
    [".gallery-grid", ".gallery-card", "fadeUp"],
    [".doctor-grid", ".doctor-card", "fadeUp"],
    [".doctor-poster-grid", ".doctor-poster", "fadeUp"],
    [".facility-grid", ".facility-card", "fadeUp"],
    [".resource-grid", ".resource-card", "fadeUp"],
    [".detail-stack", ".detail-card", "fadeUp"],
    [".trust-grid", ".trust-card", "fadeUp"],
    [".testimonial-grid", ".testimonial-card", "fadeUp"],
    [".testimonial-slider__track", ".testimonial-slide", "fadeUp"],
    [".about-card__stats", "article", "fadeUp"],
    [".contact-actions", "a, .contact-timings", "fadeIn"],
    [".card-actions", "a, button", "fadeIn"]
  ].forEach(([containerSelector, childSelector, variant]) => {
    root.querySelectorAll(containerSelector).forEach((container) => {
      sequence(container.querySelectorAll(childSelector), variant, 80, 80);
    });
  });

  const appointmentForm = root.querySelector(".appointment-form");
  if (appointmentForm) {
    const fields = appointmentForm.querySelectorAll("label, .appointment-form__helper, .appointment-form__row, button");
    sequence(fields, "fadeUp", 90, 70);
  }
}

function observeAnimations(root) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animatedElements = root.querySelectorAll("[data-motion]");

  if (reduceMotion) {
    animatedElements.forEach((element) => element.classList.add("is-inview"));
    return { disconnect() {} };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-inview");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  animatedElements.forEach((element) => observer.observe(element));
  return observer;
}

export function createMotionSystem(root = document) {
  let observer = null;

  const refresh = () => {
    splitHeroHeading(root);
    decorateHero(root);
    decorateStaticSections(root);

    if (observer?.disconnect) {
      observer.disconnect();
    }

    observer = observeAnimations(root);
  };

  refresh();

  return {
    refresh,
    disconnect() {
      observer?.disconnect?.();
    }
  };
}

export function openAnimatedLayer(element) {
  if (!element) {
    return;
  }

  const existingTimer = layerTimers.get(element);
  if (existingTimer) {
    clearTimeout(existingTimer);
    layerTimers.delete(element);
  }

  element.hidden = false;
  requestAnimationFrame(() => {
    element.classList.add("is-open");
  });
}

export function closeAnimatedLayer(element, onClosed) {
  if (!element) {
    return;
  }

  element.classList.remove("is-open");
  const timer = setTimeout(() => {
    element.hidden = true;
    layerTimers.delete(element);
    onClosed?.();
  }, 220);

  layerTimers.set(element, timer);
}
