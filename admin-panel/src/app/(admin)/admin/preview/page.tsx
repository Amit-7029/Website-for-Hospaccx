"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { LivePreviewShell } from "@/features/preview/components/live-preview-shell";
import type { PreviewSection } from "@/features/preview/types";

const VALID_SECTIONS: PreviewSection[] = ["homepage", "hero", "services", "doctors", "reviews"];

export default function PreviewPage() {
  const searchParams = useSearchParams();
  const requestedSection = searchParams.get("section") as PreviewSection | null;
  const allowedSections = useMemo(() => {
    if (requestedSection && VALID_SECTIONS.includes(requestedSection)) {
      return [requestedSection, "homepage"].filter((item, index, items) => items.indexOf(item) === index) as PreviewSection[];
    }

    return VALID_SECTIONS;
  }, [requestedSection]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Preview"
        description="This tab mirrors your current draft layer so you can review the website without publishing changes."
      />

      <LivePreviewShell
        title="Full website preview"
        description="Draft mode reads your unsaved changes from the admin preview layer. Turn it off anytime to compare with the saved Firebase data."
        allowedSections={allowedSections}
      />
    </div>
  );
}
