"use client";

import { useEffect } from "react";
import { PageErrorState } from "@/components/shared/page-error-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <PageErrorState
          title="Admin app error"
          description="The admin panel hit an unexpected error. Try reloading this screen."
          onRetry={reset}
        />
      </div>
    </div>
  );
}
