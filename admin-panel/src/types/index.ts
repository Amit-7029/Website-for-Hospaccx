export type UserRole = "admin" | "staff";
export type UserStatus = "active" | "inactive";
export type UserPermission =
  | "dashboard_view"
  | "doctors_view"
  | "doctors_add"
  | "doctors_edit"
  | "doctors_delete"
  | "services_view"
  | "services_add"
  | "services_edit"
  | "services_delete"
  | "media_view"
  | "media_upload"
  | "media_delete"
  | "reviews_view"
  | "reviews_approve"
  | "reviews_delete"
  | "appointments_view"
  | "appointments_update"
  | "appointments_delete"
  | "seo_view"
  | "seo_edit"
  | "settings_view"
  | "settings_edit"
  | "users_view"
  | "users_add"
  | "users_edit"
  | "users_delete"
  | "roles_view"
  | "roles_add"
  | "roles_edit"
  | "roles_delete";

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  roleId?: string;
  roleName?: string;
  permissions: UserPermission[];
  status: UserStatus;
  isActive: boolean;
  avatarUrl?: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  description: string;
  permissions: UserPermission[];
  system?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roleId?: string;
  roleName?: string;
  permissions?: UserPermission[];
  status: UserStatus;
  system?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  visualBadgeText: string;
  imageUrl: string;
  backgroundImageUrl: string;
  overlayOpacity: number;
  overlayColor: string;
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
  infoCardOneTitle: string;
  infoCardOneText: string;
  infoCardTwoTitle: string;
  infoCardTwoText: string;
  infoCardThreeTitle: string;
  infoCardThreeText: string;
  infoCardFourTitle: string;
  infoCardFourText: string;
  trustEyebrow: string;
  trustHeading: string;
  statsOneValue: string;
  statsOneLabel: string;
  statsOneProgress: string;
  statsTwoValue: string;
  statsTwoLabel: string;
  statsTwoProgress: string;
  statsThreeValue: string;
  statsThreeLabel: string;
  statsThreeProgress: string;
  statsFourValue: string;
  statsFourLabel: string;
  statsFourProgress: string;
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
  healthcareFeatureDescription: string;
  healthcareFeatureServiceOneTitle: string;
  healthcareFeatureServiceOneText: string;
  healthcareFeatureServiceTwoTitle: string;
  healthcareFeatureServiceTwoText: string;
  healthcareFeatureServiceThreeTitle: string;
  healthcareFeatureServiceThreeText: string;
  healthcareFeatureServiceFourTitle: string;
  healthcareFeatureServiceFourText: string;
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
  doctorsOverlayBadge: string;
  doctorsOverlayDescription: string;
  doctorsOverlayImageUrl: string;
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
