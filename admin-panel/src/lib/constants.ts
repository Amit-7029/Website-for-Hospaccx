import type { CmsContent, DiagnosticService } from "@/types";

export const DEFAULT_CMS_CONTENT: CmsContent = {
  heroHeading: "Trusted diagnostics and patient-centered healthcare in Sainthia",
  heroDescription:
    "Manage homepage highlights, contact information, and trust-building content from one secure admin dashboard.",
  aboutHeading: "Committed to quality healthcare and accurate diagnostics",
  aboutDescription:
    "Keep your website content aligned with the latest clinic messaging, patient services, and operational updates.",
  contactPhone: "+91 97320 29834",
  contactEmail: "hospaccx.snt@gmail.com",
  contactAddress: "Sainthia, Birbhum, West Bengal, India",
  emergencyText: "24x7 emergency and ICU support available for urgent care needs.",
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
