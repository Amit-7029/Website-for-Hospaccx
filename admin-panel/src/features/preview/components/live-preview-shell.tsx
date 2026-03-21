"use client";

import Link from "next/link";
import { Eye, Monitor, RefreshCw, Smartphone, Tablet, WandSparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePreviewStore } from "@/store/preview-store";
import type { PreviewDevice, PreviewSection, WebsitePreviewSnapshot } from "@/features/preview/types";
import { usePreviewSeed } from "@/features/preview/hooks/use-preview-seed";
import { PreviewErrorBoundary } from "@/features/preview/components/preview-error-boundary";
import { WebsitePreview } from "@/features/preview/components/website-preview";

const DEVICE_OPTIONS: Array<{ value: PreviewDevice; label: string; icon: typeof Monitor; width: string }> = [
  { value: "desktop", label: "Desktop", icon: Monitor, width: "100%" },
  { value: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
  { value: "mobile", label: "Mobile", icon: Smartphone, width: "375px" },
];

const SECTION_LABELS: Record<PreviewSection, string> = {
  homepage: "Full Homepage",
  hero: "Hero",
  services: "Services",
  doctors: "Doctors",
  reviews: "Reviews",
};

export function LivePreviewShell({
  title = "Live Preview",
  description = "Preview unsaved edits before you publish them.",
  seed,
  allowedSections,
  resetLabel = "Reset changes",
  onReset,
}: {
  title?: string;
  description?: string;
  seed?: Partial<WebsitePreviewSnapshot>;
  allowedSections: PreviewSection[];
  resetLabel?: string;
  onReset?: () => void;
}) {
  const { snapshot, isLoading } = usePreviewSeed(seed);
  const section = usePreviewStore((state) => state.section);
  const setSection = usePreviewStore((state) => state.setSection);
  const device = usePreviewStore((state) => state.device);
  const setDevice = usePreviewStore((state) => state.setDevice);
  const draftMode = usePreviewStore((state) => state.draftMode);
  const setDraftMode = usePreviewStore((state) => state.setDraftMode);
  const activeSection = allowedSections.includes(section) ? section : allowedSections[0];
  const activeDevice = DEVICE_OPTIONS.find((option) => option.value === device) ?? DEVICE_OPTIONS[0];

  return (
    <Card className="sticky top-24 overflow-hidden rounded-[30px] border-border/70 bg-card/95 backdrop-blur">
      <CardHeader className="space-y-4 border-b border-border/60 bg-muted/30">
        <div className="flex flex-col gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>

          <div className="grid gap-3">
            <Select value={activeSection} onChange={(event) => setSection(event.target.value as PreviewSection)}>
              {allowedSections.map((option) => (
                <option key={option} value={option}>
                  {SECTION_LABELS[option]}
                </option>
              ))}
            </Select>

            <div className="flex flex-wrap gap-2">
              {DEVICE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = option.value === activeDevice.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    onClick={() => setDevice(option.value)}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={draftMode ? "secondary" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setDraftMode(!draftMode)}
              >
                <WandSparkles className="h-4 w-4" />
                {draftMode ? "Draft Mode On" : "Draft Mode Off"}
              </Button>
              {onReset ? (
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={onReset}>
                  <RefreshCw className="h-4 w-4" />
                  {resetLabel}
                </Button>
              ) : null}
              <Link
                href={`/admin/preview?section=${activeSection}`}
                target="_blank"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
              >
                <Eye className="h-4 w-4" />
                Preview in new tab
              </Link>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <PreviewErrorBoundary>
          <div className="max-h-[78vh] overflow-auto bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_42%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] p-4">
            {isLoading ? (
              <div className="mx-auto space-y-4" style={{ width: activeDevice.width }}>
                <Skeleton className="h-64 rounded-[28px]" />
                <Skeleton className="h-52 rounded-[28px]" />
                <Skeleton className="h-52 rounded-[28px]" />
              </div>
            ) : (
              <div
                className={cn("mx-auto overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_-42px_rgba(15,23,42,0.48)] transition-all duration-300")}
                style={{ width: activeDevice.width }}
              >
                <WebsitePreview section={activeSection} snapshot={snapshot} />
              </div>
            )}
          </div>
        </PreviewErrorBoundary>
      </CardContent>
    </Card>
  );
}
