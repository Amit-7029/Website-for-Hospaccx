const CACHE_PREFIX = "hospaccx-runtime-cache-v2";

function safeStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function cacheKey(key) {
  return `${CACHE_PREFIX}:${key}`;
}

export function getRuntimePerformanceProfile() {
  if (typeof window === "undefined") {
    return {
      lowDataMode: false,
      reducedAnimationMode: false,
      effectiveType: "4g",
      saveData: false
    };
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const effectiveType = String(connection?.effectiveType || "4g").toLowerCase();
  const saveData = Boolean(connection?.saveData);
  const downlink = Number(connection?.downlink || 0);
  const deviceMemory = Number(navigator.deviceMemory || 0);
  const reducedAnimationMode =
    saveData ||
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    (downlink > 0 && downlink < 0.8) ||
    (deviceMemory > 0 && deviceMemory <= 2);
  const lowDataMode =
    saveData ||
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    (downlink > 0 && downlink < 0.5);

  return {
    lowDataMode,
    reducedAnimationMode,
    effectiveType,
    saveData
  };
}

export function readCachedResource(key, maxAgeMs) {
  const storage = safeStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(cacheKey(key));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !("data" in parsed)) {
      return null;
    }

    const isFresh = Date.now() - Number(parsed.timestamp) <= maxAgeMs;
    return {
      isFresh,
      data: parsed.data
    };
  } catch {
    return null;
  }
}

export function writeCachedResource(key, data) {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      cacheKey(key),
      JSON.stringify({
        timestamp: Date.now(),
        data
      })
    );
  } catch {
    // Ignore quota or storage access errors.
  }
}

export function scheduleDeferredTask(task, timeout = 1200) {
  if (typeof window === "undefined") {
    return;
  }

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      void task();
    }, { timeout });
    return;
  }

  window.setTimeout(() => {
    void task();
  }, Math.min(timeout, 600));
}
