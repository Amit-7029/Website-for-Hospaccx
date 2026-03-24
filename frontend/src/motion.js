import { getRuntimePerformanceProfile } from "./utils/runtime-performance";

export const motionVariants = {
  fadeUp: { x: 0, y: 26, scale: 0.988, duration: 880 },
  fadeIn: { x: 0, y: 0, scale: 0.992, duration: 720 },
  slideLeft: { x: -34, y: 0, scale: 0.99, duration: 900 },
  slideRight: { x: 34, y: 0, scale: 0.99, duration: 900 },
  staggerContainer: { x: 0, y: 0, scale: 1, duration: 760 }
};

const layerTimers = new WeakMap();

function matchesMedia(query, fallback = false) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return fallback;
  }

  return window.matchMedia(query).matches;
}

function setMotion(el, variant = "fadeUp", options = {}) {
  if (!el) {
    return;
  }

  const definition = motionVariants[variant] ?? motionVariants.fadeUp;
  const runtime = getRuntimePerformanceProfile();
  const reduceMotion = matchesMedia("(prefers-reduced-motion: reduce)") || runtime.lowDataMode;
  const compactMotion = matchesMedia("(max-width: 720px)");
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

function sequence(elements, variant = "fadeUp", baseDelay = 0, step = 95) {
  Array.from(elements).forEach((element, index) => {
    setMotion(element, variant, { delay: baseDelay + index * step });
  });
}

function sequenceAlternating(elements, baseDelay = 0, step = 110) {
  Array.from(elements).forEach((element, index) => {
    setMotion(element, index % 2 === 0 ? "slideLeft" : "slideRight", {
      delay: baseDelay + index * step
    });
  });
}

function splitHeroHeading(root) {
  const runtime = getRuntimePerformanceProfile();
  const heading = root.querySelector(".hero__copy h1");
  if (!heading || heading.dataset.motionSplit === "true" || runtime.lowDataMode) {
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
  const runtime = getRuntimePerformanceProfile();
  splitHeroHeading(root);

  setMotion(root.querySelector(".hero__copy .eyebrow"), "fadeIn", { delay: 50 });
  setMotion(root.querySelector(".hero__copy h1"), "fadeIn", { delay: 110, duration: 940 });
  setMotion(root.querySelector(".hero__copy .subtitle"), "fadeUp", { delay: 240, duration: 920 });
  setMotion(root.querySelector(".hero__actions--compact"), "slideLeft", { delay: 320, duration: 900 });
  sequence(root.querySelectorAll(".hero__stats article"), "fadeUp", 420, 120);
  setMotion(root.querySelector(".hero__visual-card"), "slideRight", { delay: 200, duration: 960 });
  setMotion(root.querySelector(".hero__panel"), "fadeUp", { delay: 300, duration: 900 });

  const floatingPanel = root.querySelector(".hero__panel");
  if (floatingPanel && !runtime.lowDataMode) {
    floatingPanel.classList.add("motion-float");
  }
}

function decorateStaticSections(root) {
  root.querySelectorAll(".section__heading, .page-hero .container").forEach((element, index) => {
    setMotion(element, "fadeUp", { delay: Math.min(index * 35, 180), duration: 860 });
  });

  root.querySelectorAll(".about-grid, .appointment-layout, .contact-layout, .emergency-strip__content").forEach((grid) => {
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
      sequence(container.querySelectorAll(childSelector), variant, 120, 95);
    });
  });

  root.querySelectorAll(".doctor-grid").forEach((container) => {
    sequenceAlternating(container.querySelectorAll(".doctor-card"), 140, 115);
  });

  root.querySelectorAll(".doctor-poster-grid").forEach((container) => {
    sequenceAlternating(container.querySelectorAll(".doctor-poster"), 160, 105);
  });

  const appointmentForm = root.querySelector(".appointment-form");
  if (appointmentForm) {
    const fields = appointmentForm.querySelectorAll("label, .appointment-form__helper, .appointment-form__row, button");
    sequence(fields, "fadeUp", 120, 90);
  }

  const reviewForm = root.querySelector(".review-form");
  if (reviewForm) {
    const fields = reviewForm.querySelectorAll(".review-form__field, .review-form__rating, .review-form__helper, .review-form__footer");
    sequence(fields, "fadeUp", 140, 90);
  }
}

function observeAnimations(root) {
  const runtime = getRuntimePerformanceProfile();
  const reduceMotion = matchesMedia("(prefers-reduced-motion: reduce)") || runtime.lowDataMode;
  const animatedElements = root.querySelectorAll("[data-motion]");

  if (reduceMotion || typeof IntersectionObserver !== "function") {
    animatedElements.forEach((element) => element.classList.add("is-inview"));
    return { disconnect() {} };
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.16) {
          entry.target.classList.add("is-inview");
        } else if (entry.intersectionRatio <= 0.04) {
          entry.target.classList.remove("is-inview");
        }
      });
    },
    {
      threshold: [0, 0.04, 0.16, 0.32],
      rootMargin: "0px 0px -6% 0px"
    }
  );

  animatedElements.forEach((element) => observer.observe(element));
  return observer;
}

export function createMotionSystem(root = document) {
  let observer = null;

  const refresh = () => {
    try {
      const runtime = getRuntimePerformanceProfile();
      if (runtime.lowDataMode) {
        if (observer?.disconnect) {
          observer.disconnect();
        }

        root.querySelectorAll("[data-motion]").forEach((element) => {
          element.classList.add("is-inview");
        });
        return;
      }

      splitHeroHeading(root);
      decorateHero(root);
      decorateStaticSections(root);

      if (observer?.disconnect) {
        observer.disconnect();
      }

      observer = observeAnimations(root);
    } catch (error) {
      console.error("Motion system fallback", error);
      root.querySelectorAll("[data-motion]").forEach((element) => element.classList.add("is-inview"));
    }
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
