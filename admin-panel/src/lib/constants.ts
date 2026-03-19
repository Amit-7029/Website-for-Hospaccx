import type { CmsContent, DiagnosticService } from "@/types";

export const DEFAULT_CMS_CONTENT: CmsContent = {
  heroHeading: "Reliable healthcare and diagnostic services for Sainthia and Birbhum.",
  heroDescription:
    "For over 36 years, Banerjee Diagnostic Foundation and Hospaccx has been a trusted name in healthcare in Sainthia, Birbhum, delivering reliable diagnostics, expert medical services, and patient-centered care.",
  aboutHeading: "Committed to quality healthcare and accurate diagnostics.",
  aboutDescription:
    "Banerjee Diagnostic Foundation and Hospaccx is a modern multispecialty diagnostic and healthcare center dedicated to providing reliable medical services with accuracy, compassion, and professionalism.",
  whyChooseHeading: "Trusted by patients. Recommended by doctors.",
  missionHeading: "Delivering trusted healthcare with compassion.",
  missionDescription:
    "Our mission is to provide high-quality diagnostic and healthcare services that focus on accuracy, patient safety, and medical excellence.",
  visionHeading: "Building a healthier community.",
  visionDescription:
    "Our vision is to become one of the most trusted healthcare and diagnostic centers in Birbhum, known for medical reliability, modern technology, and compassionate patient care.",
  healthcareHeading: "Complete healthcare under one roof",
  servicesHeading: "Diagnostic & Laboratory Services",
  servicesNote:
    "Accurate laboratory support across essential diagnostic categories, presented in a clear and patient-friendly way.",
  reviewsHeading: "What our patients say",
  reviewsSubtitle: "Real experiences from our patients",
  appointmentHeading: "Book your appointment with ease",
  appointmentDescription:
    "Taking care of your health should be simple and convenient. Schedule your consultation with our experienced doctors and continue directly to WhatsApp for a fast confirmation request with our clinic team.",
  contactHeading: "Get in touch with us",
  contactDescription:
    "If you have any health concerns or need diagnostic services, feel free to contact us. Our dedicated team is always ready to support you with trusted healthcare and reliable diagnostic services.",
  contactPhone: "+91 97320 29834",
  contactEmail: "hospaccx.snt@gmail.com",
  contactAddress: "R.K. Road / R.K. Tala Road, Netaji Pally, P.O. & P.S. Sainthia, Birbhum, West Bengal 731234",
  emergencyText: "For urgent care situations, connect immediately with the hospital team for emergency, ICU, and diagnostic support.",
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
