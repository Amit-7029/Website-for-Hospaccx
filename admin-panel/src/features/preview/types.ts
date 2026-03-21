import type { CmsContent, DiagnosticService, Doctor, HeroContent, Review } from "@/types";

export type PreviewSection = "homepage" | "hero" | "services" | "doctors" | "reviews";
export type PreviewDevice = "desktop" | "tablet" | "mobile";

export interface WebsitePreviewSnapshot {
  hero: HeroContent;
  cms: CmsContent;
  doctors: Doctor[];
  services: DiagnosticService[];
  reviews: Review[];
}
