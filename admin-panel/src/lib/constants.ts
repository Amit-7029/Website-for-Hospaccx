import cmsDefaults from "@/lib/cms-defaults.json";
import type { CmsContent, DiagnosticService, HeroContent } from "@/types";

export const DEFAULT_CMS_CONTENT: CmsContent = cmsDefaults as CmsContent;

export const DEFAULT_HERO_CONTENT: HeroContent = {
  heading: "Advanced Diagnostic Services in Sainthia",
  subheading: "Accurate Reports • Experienced Doctors • Trusted Care",
  primaryButtonText: "Book Appointment",
  secondaryButtonText: "Call Now",
  primaryButtonLink: "#appointment",
  secondaryButtonLink: "tel:+919732029834",
  visualBadgeText: "LARGEST NABL LAB IN BIRBHUM",
  imageUrl: "/images/hospital-front.jpg",
  backgroundImageUrl: "/images/dignostic center front in day.jpg",
  overlayOpacity: 0.56,
  overlayColor: "#0f172a",
};

export const DEFAULT_SERVICES: DiagnosticService[] = [
  {
    id: "clinical-biochemistry",
    title: "Clinical Biochemistry",
    description: "Essential testing support for monitoring overall health and key body functions.",
    icon: "FlaskConical",
    category: "Laboratory",
  },
  {
    id: "clinical-pathology",
    title: "Clinical Pathology",
    description: "Reliable pathology workflows to support timely diagnosis and treatment planning.",
    icon: "Microscope",
    category: "Laboratory",
  },
  {
    id: "clinical-haematology",
    title: "Clinical Haematology",
    description: "Accurate blood-related diagnostic support for routine and specialized care needs.",
    icon: "Droplets",
    category: "Laboratory",
  },
];
