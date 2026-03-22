"use client";

import { useMemo } from "react";
import { useSession } from "@/components/providers/app-providers";
import { getResolvedPermissions, hasPermission as hasPermissionFromList } from "@/lib/rbac";
import type { UserPermission } from "@/types";

export function usePermissions() {
  const { sessionUser } = useSession();

  return useMemo(() => {
    const role = sessionUser?.role ?? "staff";
    const permissions = getResolvedPermissions(sessionUser);
    const hasPermission = (permission: UserPermission) => hasPermissionFromList(permissions, permission);
    const canViewDoctors = hasPermission("doctors_view");
    const canAddDoctors = hasPermission("doctors_add");
    const canEditDoctors = hasPermission("doctors_edit");
    const canDeleteDoctors = hasPermission("doctors_delete");
    const canViewCareers = hasPermission("careers_view");
    const canAddCareers = hasPermission("careers_add");
    const canEditCareers = hasPermission("careers_edit");
    const canDeleteCareers = hasPermission("careers_delete");
    const canViewApplications = hasPermission("applications_view");
    const canUpdateApplications = hasPermission("applications_update");
    const canDeleteApplications = hasPermission("applications_delete");
    const canViewServices = hasPermission("services_view");
    const canAddServices = hasPermission("services_add");
    const canEditServices = hasPermission("services_edit");
    const canDeleteServices = hasPermission("services_delete");
    const canViewMedia = hasPermission("media_view");
    const canUploadMedia = hasPermission("media_upload");
    const canDeleteMedia = hasPermission("media_delete");
    const canViewReviews = hasPermission("reviews_view");
    const canApproveReviews = hasPermission("reviews_approve");
    const canDeleteReviews = hasPermission("reviews_delete");
    const canViewAppointments = hasPermission("appointments_view");
    const canUpdateAppointments = hasPermission("appointments_update");
    const canDeleteAppointments = hasPermission("appointments_delete");
    const canViewSeo = hasPermission("seo_view");
    const canEditSeo = hasPermission("seo_edit");
    const canViewSettings = hasPermission("settings_view");
    const canEditSettings = hasPermission("settings_edit");
    const canViewUsers = hasPermission("users_view");
    const canAddUsers = hasPermission("users_add");
    const canEditUsers = hasPermission("users_edit");
    const canDeleteUsers = hasPermission("users_delete");
    const canViewRoles = hasPermission("roles_view");
    const canAddRoles = hasPermission("roles_add");
    const canEditRoles = hasPermission("roles_edit");
    const canDeleteRoles = hasPermission("roles_delete");

    return {
      role,
      permissions,
      hasPermission,
      isAdmin: role === "admin",
      isStaff: role === "staff" || role === "admin",
      canAccessDashboard: hasPermission("dashboard_view"),
      canViewDoctors,
      canAddDoctors,
      canEditDoctors,
      canDeleteDoctors,
      canManageDoctors: canAddDoctors || canEditDoctors,
      canViewCareers,
      canAddCareers,
      canEditCareers,
      canDeleteCareers,
      canManageCareers: canAddCareers || canEditCareers,
      canViewApplications,
      canUpdateApplications,
      canDeleteApplications,
      canManageApplications: canUpdateApplications || canDeleteApplications,
      canViewServices,
      canAddServices,
      canEditServices,
      canDeleteServices,
      canManageServices: canAddServices || canEditServices,
      canViewMedia,
      canUploadMedia,
      canDeleteMedia,
      canAccessMedia: canViewMedia || canUploadMedia || canDeleteMedia,
      canViewReviews,
      canApproveReviews,
      canDeleteReviews,
      canModerateReviews: canApproveReviews || canDeleteReviews,
      canViewAppointments,
      canUpdateAppointments,
      canDeleteAppointments,
      canAccessAppointments: canViewAppointments || canUpdateAppointments || canDeleteAppointments,
      canViewSeo,
      canEditSeo,
      canManageSeo: canViewSeo || canEditSeo,
      canViewSettings,
      canEditSettings,
      canManageCms: canEditSettings,
      canViewUsers,
      canAddUsers,
      canEditUsers,
      canDeleteUsers,
      canViewRoles,
      canAddRoles,
      canEditRoles,
      canDeleteRoles,
      canManageUsers: canViewUsers || canAddUsers || canEditUsers || canDeleteUsers || canViewRoles || canAddRoles || canEditRoles || canDeleteRoles,
    };
  }, [sessionUser]);
}
