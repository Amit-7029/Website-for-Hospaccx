"use client";

import { useEffect } from "react";

export function useDebouncedPreview<T>(value: T, onCommit: (value: T) => void, delay = 300) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onCommit(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, onCommit, value]);
}
