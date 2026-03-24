import { getRuntimePerformanceProfile } from "./utils/runtime-performance";

export const motionVariants = {
  fadeUp: { x: 0, y: 18, scale: 0.995, duration: 420 },
  fadeIn: { x: 0, y: 0, scale: 0.998, duration: 360 },
  slideLeft: { x: -20, y: 0, scale: 0.997, duration: 480 },
  slideRight: { x: 20, y: 0, scale: 0.997, duration: 480 },
  staggerContainer: { x: 0, y: 0, scale: 1, duration: 420 }
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

function sequence(elements, variant = "fadeUp", baseDelay = 0, step = 70) {
  Array.from(elements).forEach((element, index) => {
    setMotion(element, variant, { delay: baseDelay + index * step });
  });
}

function sequenceAlternating(elements, baseDelay = 0, step = 80) {
  Array.from(elements).forEach((element, index) => {
    setMotion(element, index % 2 === 0 ? "slideLeft" : "slideRight", {
      delay: baseDelay + index * step
    });
  });
}

function splitHeroHeading(root) {
  const heading = root.querySelector(".hero__copy h1");
  if (!heading) {
    return;
  }

  heading.classList.remove("motion-heading");
}

function decorateHero(root) {
  const runtime = getRuntimePerformanceProfile();
  splitHeroHeading(root);

  setMotion(root.querySelector(".hero__copy .eyebrow"), "fadeIn", { delay: 50 });
  setMotion(root.querySelector(".hero__copy h1"), "fadeUp", { delay: 110, duration: 520 });
  setMotion(root.querySelector(".hero__copy .subtitle"), "fadeUp", { delay: 180, duration: 460 });
  setMotion(root.querySelector(".hero__actions--compact"), "fadeUp", { delay: 240, duration: 420 });
  sequence(root.querySelectorAll(".hero__stats article"), "fadeUp", 280, 70);
  setMotion(root.querySelector(".hero__visual-card"), "slideRight", { delay: 170, duration: 500 });
  setMotion(root.querySelector(".hero__panel"), "fadeUp", { delay: 220, duration: 440 });

  const floatingPanel = root.querySelector(".hero__panel");
  if (floatingPanel && !runtime.lowDataMode) {
    floatingPanel.classList.add("motion-float");
  }
}

function decorateStaticSections(root) {
  root.querySelectorAll(".section__heading, .page-hero .container").forEach((element, index) => {
    setMotion(element, "fadeUp", { delay: Math.min(index * 24, 120), duration: 420 });
  });

  [
    [".service-grid", ".service-card", "fadeUp"],
    [".doctor-grid", ".doctor-card", "fadeUp"],
    [".doctor-poster-grid", ".doctor-poster", "fadeUp"],
    [".gallery-grid", ".gallery-card", "fadeUp"],
    [".media-showcase-grid", ".media-feature-card", "fadeUp"],
    [".testimonial-grid", ".testimonial-card", "fadeUp"],
    [".card-actions", "a, button", "fadeIn"],
    [".hero__actions", "a, button", "fadeIn"]
  ].forEach(([containerSelector, childSelector, variant]) => {
    root.querySelectorAll(containerSelector).forEach((container) => {
      sequence(container.querySelectorAll(childSelector), variant, 100, 70);
    });
  });
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
        if (entry.isIntersecting && entry.intersectionRatio >= 0.14) {
          entry.target.classList.add("is-inview");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: [0, 0.14, 0.28],
      rootMargin: "0px 0px -8% 0px"
    }
  );

  animatedElements.forEach((element) => observer.observe(element));
  return observer;
}

export function createMotionSystem(root = document) {
  let observer = null;
  let refreshFrame = 0;

  const runRefresh = () => {
    try {
      const runtime = getRuntimePerformanceProfile();
      if (runtime.lowDataMode) {
        if (observer?.disconnect) {
          observer.disconnect();
        }
        refreshFrame = 0;

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
      refreshFrame = 0;
    } catch (error) {
      console.error("Motion system fallback", error);
      root.querySelectorAll("[data-motion]").forEach((element) => element.classList.add("is-inview"));
      refreshFrame = 0;
    }
  };

  const refresh = () => {
    if (typeof window === "undefined") {
      runRefresh();
      return;
    }

    if (refreshFrame) {
      window.cancelAnimationFrame(refreshFrame);
    }

    refreshFrame = window.requestAnimationFrame(runRefresh);
  };

  refresh();

  return {
    refresh,
    disconnect() {
      if (refreshFrame && typeof window !== "undefined") {
        window.cancelAnimationFrame(refreshFrame);
      }
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
