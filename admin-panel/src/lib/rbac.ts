import type { AdminUser, RoleRecord, UserPermission, UserRole, UserStatus } from "@/types";

export const ALL_PERMISSIONS: UserPermission[] = [
  "dashboard_view",
  "doctors_view",
  "doctors_add",
  "doctors_edit",
  "doctors_delete",
  "careers_view",
  "careers_add",
  "careers_edit",
  "careers_delete",
  "applications_view",
  "applications_update",
  "applications_delete",
  "services_view",
  "services_add",
  "services_edit",
  "services_delete",
  "media_view",
  "media_upload",
  "media_delete",
  "reviews_view",
  "reviews_approve",
  "reviews_delete",
  "appointments_view",
  "appointments_update",
  "appointments_delete",
  "seo_view",
  "seo_edit",
  "settings_view",
  "settings_edit",
  "users_view",
  "users_add",
  "users_edit",
  "users_delete",
  "roles_view",
  "roles_add",
  "roles_edit",
  "roles_delete",
];

export const STAFF_PERMISSIONS: UserPermission[] = [
  "dashboard_view",
  "doctors_view",
  "services_view",
  "appointments_view",
  "reviews_view",
];

const LEGACY_PERMISSION_ALIASES: Record<string, UserPermission> = {
  access_dashboard: "dashboard_view",
  view_doctors: "doctors_view",
  edit_doctors: "doctors_edit",
  delete_doctors: "doctors_delete",
  view_careers: "careers_view",
  edit_careers: "careers_edit",
  delete_careers: "careers_delete",
  view_applications: "applications_view",
  update_applications: "applications_update",
  delete_applications: "applications_delete",
  view_services: "services_view",
  edit_services: "services_edit",
  delete_services: "services_delete",
  access_media: "media_view",
  moderate_reviews: "reviews_approve",
  access_appointments: "appointments_view",
  access_seo: "seo_view",
  access_settings: "settings_view",
  manage_users: "users_view",
};

export const SYSTEM_ROLE_IDS = {
  admin: "system_admin",
  staff: "system_staff",
} as const;

export const DEFAULT_ROLE_RECORDS: RoleRecord[] = [
  {
    id: SYSTEM_ROLE_IDS.admin,
    name: "Admin",
    description: "Full administrative access across the entire system.",
    permissions: ALL_PERMISSIONS,
    system: true,
  },
  {
    id: SYSTEM_ROLE_IDS.staff,
    name: "Staff",
    description: "Operational access for day-to-day updates without destructive control.",
    permissions: STAFF_PERMISSIONS,
    system: true,
  },
];

export function mergeWithSystemRole(roleRecord: Pick<RoleRecord, "id" | "name" | "description" | "permissions"> & Partial<RoleRecord>) {
  const systemRole = DEFAULT_ROLE_RECORDS.find((item) => item.id === roleRecord.id);
  if (!systemRole) {
    return {
      ...roleRecord,
      permissions: sanitizePermissions(roleRecord.permissions),
    } as RoleRecord;
  }

  return {
    ...roleRecord,
    name: roleRecord.name || systemRole.name,
    description: roleRecord.description || systemRole.description,
    system: true,
    permissions: [...new Set([...systemRole.permissions, ...sanitizePermissions(roleRecord.permissions)])],
  } as RoleRecord;
}

export const PERMISSION_GROUPS: Array<{
  title: string;
  permissions: Array<{ key: UserPermission; label: string; description: string }>;
}> = [
  {
    title: "Dashboard",
    permissions: [
      { key: "dashboard_view", label: "Dashboard access", description: "Open the overview dashboard and activity stream." },
    ],
  },
  {
    title: "Doctors",
    permissions: [
      { key: "doctors_view", label: "View doctors", description: "See doctor records and open the doctors module." },
      { key: "doctors_add", label: "Add doctors", description: "Create new doctor profiles." },
      { key: "doctors_edit", label: "Edit doctors", description: "Update doctor profiles." },
      { key: "doctors_delete", label: "Delete doctors", description: "Remove doctor profiles permanently." },
    ],
  },
  {
    title: "Careers",
    permissions: [
      { key: "careers_view", label: "View careers", description: "Open job listings and careers dashboard." },
      { key: "careers_add", label: "Add jobs", description: "Create new job openings." },
      { key: "careers_edit", label: "Edit jobs", description: "Update existing job openings." },
      { key: "careers_delete", label: "Delete jobs", description: "Remove job openings permanently." },
      { key: "applications_view", label: "View applications", description: "Open submitted career applications." },
      { key: "applications_update", label: "Update applications", description: "Change application status for shortlisted candidates." },
      { key: "applications_delete", label: "Delete applications", description: "Delete application records and resume links." },
    ],
  },
  {
    title: "Services",
    permissions: [
      { key: "services_view", label: "View services", description: "See diagnostic service records." },
      { key: "services_add", label: "Add services", description: "Create diagnostic services." },
      { key: "services_edit", label: "Edit services", description: "Update diagnostic services." },
      { key: "services_delete", label: "Delete services", description: "Delete diagnostic service entries." },
    ],
  },
  {
    title: "Website",
    permissions: [
      { key: "media_view", label: "View media", description: "Open media library and inspect current assets." },
      { key: "media_upload", label: "Upload media", description: "Add or replace hero, gallery, and section media assets." },
      { key: "media_delete", label: "Delete media", description: "Remove media assets from the library." },
      { key: "reviews_view", label: "View reviews", description: "Open patient reviews and feedback records." },
      { key: "reviews_approve", label: "Approve reviews", description: "Approve or reject patient reviews." },
      { key: "reviews_delete", label: "Delete reviews", description: "Remove inappropriate patient reviews." },
      { key: "appointments_view", label: "View appointments", description: "Open appointment requests." },
      { key: "appointments_update", label: "Update appointments", description: "Change appointment status and details." },
      { key: "appointments_delete", label: "Delete appointments", description: "Delete appointment records." },
      { key: "seo_view", label: "View SEO", description: "Open SEO settings and metadata controls." },
      { key: "seo_edit", label: "Edit SEO", description: "Update SEO settings and metadata controls." },
      { key: "settings_view", label: "View settings", description: "Open CMS, hero, and website settings." },
      { key: "settings_edit", label: "Edit settings", description: "Manage CMS, hero, and general website settings." },
    ],
  },
  {
    title: "Administration",
    permissions: [
      { key: "users_view", label: "View users", description: "Open the user management module." },
      { key: "users_add", label: "Add users", description: "Create user accounts and assign roles." },
      { key: "users_edit", label: "Edit users", description: "Update user roles and access status." },
      { key: "users_delete", label: "Delete users", description: "Remove user accounts." },
      { key: "roles_view", label: "View roles", description: "Open the roles and permissions module." },
      { key: "roles_add", label: "Add roles", description: "Create new roles and permission bundles." },
      { key: "roles_edit", label: "Edit roles", description: "Update role descriptions and permissions." },
      { key: "roles_delete", label: "Delete roles", description: "Remove custom roles that are no longer needed." },
    ],
  },
];

export function toCanonicalPermission(input: unknown) {
  if (typeof input !== "string") {
    return null;
  }

  if (ALL_PERMISSIONS.includes(input as UserPermission)) {
    return input as UserPermission;
  }

  return LEGACY_PERMISSION_ALIASES[input] ?? null;
}

export function sanitizePermissions(input: unknown): UserPermission[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const normalized = input
    .map((permission) => toCanonicalPermission(permission))
    .filter((permission): permission is UserPermission => Boolean(permission));

  return [...new Set(normalized)];
}

export function normalizeLegacyRole(value?: string): UserRole {
  return value === "admin" ? "admin" : "staff";
}

export function getDefaultRoleId(role: UserRole) {
  return role === "admin" ? SYSTEM_ROLE_IDS.admin : SYSTEM_ROLE_IDS.staff;
}

export function getLegacyPermissions(role: UserRole): UserPermission[] {
  return role === "admin" ? ALL_PERMISSIONS : STAFF_PERMISSIONS;
}

export function inferRoleFromPermissions(permissions: UserPermission[]): UserRole {
  return permissions.some((permission) =>
    [
      "users_view",
      "users_add",
      "users_edit",
      "users_delete",
      "roles_view",
      "roles_add",
      "roles_edit",
      "roles_delete",
      "settings_edit",
      "seo_edit",
    ].includes(permission),
  )
    ? "admin"
    : "staff";
}

export function normalizeUserStatus(value?: string): UserStatus {
  return value === "inactive" ? "inactive" : "active";
}

export function hasPermission(permissions: UserPermission[], permission: UserPermission) {
  const normalizedPermissions = sanitizePermissions(permissions);
  return normalizedPermissions.includes(permission);
}

export function usesLegacyPermissionFallback(user: Pick<AdminUser, "role" | "roleId"> | null | undefined) {
  if (!user) {
    return false;
  }

  return !user.roleId || user.roleId === SYSTEM_ROLE_IDS.admin || user.roleId === SYSTEM_ROLE_IDS.staff;
}

export function getResolvedPermissions(user: Pick<AdminUser, "permissions" | "role" | "roleId"> | null | undefined) {
  if (!user) {
    return [] as UserPermission[];
  }

  if (user.permissions?.length) {
    return user.permissions;
  }

  return usesLegacyPermissionFallback(user) ? getLegacyPermissions(user.role) : [];
}

export function sessionHasPermission(
  user: Pick<AdminUser, "permissions" | "role" | "roleId" | "status" | "isActive"> | null | undefined,
  permission: UserPermission,
) {
  if (!user || user.status === "inactive" || user.isActive === false) {
    return false;
  }

  return hasPermission(getResolvedPermissions(user), permission);
}
