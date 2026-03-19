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

export interface CmsContent {
  heroHeading: string;
  heroDescription: string;
  aboutHeading: string;
  aboutDescription: string;
  whyChooseHeading: string;
  missionHeading: string;
  missionDescription: string;
  visionHeading: string;
  visionDescription: string;
  healthcareHeading: string;
  servicesHeading: string;
  servicesNote: string;
  reviewsHeading: string;
  reviewsSubtitle: string;
  appointmentHeading: string;
  appointmentDescription: string;
  contactHeading: string;
  contactDescription: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
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
