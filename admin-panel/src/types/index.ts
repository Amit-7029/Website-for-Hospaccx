export type UserRole = "admin" | "staff";

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  qualification: string;
  availability: string[];
  description: string;
  services: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DiagnosticService {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  caption?: string;
  alt?: string;
  imageUrl: string;
  section: "hero" | "highlights" | "gallery" | "whyChoose" | "healthcare" | "pharmacies" | "services";
  category: string;
  ctaLabel?: string;
  ctaLink?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HeroContent {
  heading: string;
  subheading: string;
  primaryButtonText: string;
  secondaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonLink: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  name?: string;
  rating: number;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export interface Appointment {
  id: string;
  name: string;
  phone: string;
  date: string;
  message?: string;
  doctor?: string;
  status: "pending" | "confirmed" | "completed";
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "appointment" | "review" | "system";
  entityId?: string;
  entityType?: "appointment" | "review" | "doctor" | "service" | "cms" | "media";
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CmsContent {
  [key: string]: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoOgImageUrl: string;
  heroHeading: string;
  heroDescription: string;
  topbarTagline: string;
  navAboutLabel: string;
  navWhyChooseLabel: string;
  navMissionLabel: string;
  navVisionLabel: string;
  navDepartmentsLabel: string;
  navDoctorsLabel: string;
  navServicesLabel: string;
  navFacilitiesLabel: string;
  navTreatmentsLabel: string;
  navContactLabel: string;
  heroEyebrow: string;
  heroPrimaryCtaLabel: string;
  heroSecondaryCtaLabel: string;
  heroPanelEyebrow: string;
  heroPanelHeading: string;
  heroFeatureOne: string;
  heroFeatureTwo: string;
  heroFeatureThree: string;
  heroLocationLabel: string;
  heroQrLabel: string;
  heroQrText: string;
  heroQrImageUrl: string;
  heroStatOneTitle: string;
  heroStatOneText: string;
  heroStatTwoTitle: string;
  heroStatTwoText: string;
  heroStatThreeTitle: string;
  heroStatThreeText: string;
  aboutEyebrow: string;
  aboutHeading: string;
  aboutDescription: string;
  aboutParagraphTwo: string;
  aboutParagraphThree: string;
  aboutHighlightsTitle: string;
  trustEyebrow: string;
  trustHeading: string;
  departmentsEyebrow: string;
  departmentsHeading: string;
  whyChooseEyebrow: string;
  whyChooseHeading: string;
  whyChooseCardOneTitle: string;
  whyChooseCardOneText: string;
  whyChooseCardTwoTitle: string;
  whyChooseCardTwoText: string;
  whyChooseCardThreeTitle: string;
  whyChooseCardThreeText: string;
  missionEyebrow: string;
  missionHeading: string;
  missionDescription: string;
  missionExtra: string;
  visionEyebrow: string;
  visionHeading: string;
  visionDescription: string;
  visionExtra: string;
  healthcareEyebrow: string;
  healthcareHeading: string;
  healthcareCardOneTitle: string;
  healthcareCardOneText: string;
  healthcareCardTwoTitle: string;
  healthcareCardTwoText: string;
  healthcareCardThreeTitle: string;
  healthcareCardThreeText: string;
  facilitiesEyebrow: string;
  facilitiesHeading: string;
  pharmaciesEyebrow: string;
  pharmaciesHeading: string;
  pharmacyCardOneTitle: string;
  pharmacyCardOneText: string;
  pharmacyCardTwoTitle: string;
  pharmacyCardTwoText: string;
  pharmacyCardThreeTitle: string;
  pharmacyCardThreeText: string;
  galleryEyebrow: string;
  galleryHeading: string;
  galleryButtonLabel: string;
  insideCenterEyebrow: string;
  insideCenterHeading: string;
  insideCenterNote: string;
  servicesEyebrow: string;
  servicesHeading: string;
  servicesNote: string;
  servicesIntro: string;
  servicesPageButtonLabel: string;
  doctorsEyebrow: string;
  doctorsHeading: string;
  doctorGalleryEyebrow: string;
  doctorGalleryHeading: string;
  treatmentsEyebrow: string;
  treatmentsHeading: string;
  treatmentsButtonLabel: string;
  reviewsEyebrow: string;
  reviewsHeading: string;
  reviewsSubtitle: string;
  reviewsSummaryCopy: string;
  reviewFormEyebrow: string;
  reviewFormHeading: string;
  blogEyebrow: string;
  blogHeading: string;
  blogButtonLabel: string;
  appointmentEyebrow: string;
  appointmentHeading: string;
  appointmentDescription: string;
  appointmentButtonLabel: string;
  contactEyebrow: string;
  contactHeading: string;
  contactDescription: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  contactSocialTitle: string;
  contactMapButtonLabel: string;
  contactPageButtonLabel: string;
  contactTimingsTitle: string;
  contactTimingsText: string;
  footerTagline: string;
  footerHighlightLabel: string;
  footerHighlightDescription: string;
  emergencyText: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actorName: string;
  actorRole: UserRole;
  createdAt?: string;
}

export interface DashboardStats {
  totalDoctors: number;
  totalAppointments: number;
  totalReviews: number;
  pendingReviews: number;
  pendingAppointments: number;
}

export interface DashboardAnalyticsPoint {
  label: string;
  value: number;
}

export interface ReviewRatingsPoint {
  label: string;
  value: number;
}

export interface DashboardAnalytics {
  dailyAppointments: DashboardAnalyticsPoint[];
  monthlyGrowth: DashboardAnalyticsPoint[];
  reviewRatings: ReviewRatingsPoint[];
}

export interface GlobalSearchResult {
  id: string;
  type: "doctor" | "service" | "appointment";
  title: string;
  subtitle: string;
  href: string;
}
