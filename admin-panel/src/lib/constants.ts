import cmsDefaults from "@/lib/cms-defaults.json";
import type { CmsContent, DiagnosticService } from "@/types";

export const DEFAULT_CMS_CONTENT: CmsContent = cmsDefaults as CmsContent;

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
