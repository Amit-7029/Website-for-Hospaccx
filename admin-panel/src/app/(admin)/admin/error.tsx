"use client";

import { useEffect } from "react";
import { PageErrorState } from "@/components/shared/page-error-state";

export default function AdminErrorBoundary({
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
    <div className="space-y-6">
      <PageErrorState
        title="This admin section failed to load"
        description="The rest of the dashboard is still safe. Retry this section and we’ll reload it."
        onRetry={reset}
      />
    </div>
  );
}
