"use client";

import { useMemo } from "react";
import { useSession } from "@/components/providers/app-providers";

export function usePermissions() {
  const { sessionUser } = useSession();

  return useMemo(() => {
    const role = sessionUser?.role ?? "staff";
    return {
      role,
      isAdmin: role === "admin",
      isStaff: role === "staff" || role === "admin",
      canDelete: role === "admin",
      canManageSeo: role === "admin",
      canManageCms: role === "admin",
    };
  }, [sessionUser?.role]);
}
