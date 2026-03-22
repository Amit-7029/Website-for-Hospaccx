"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { addActivityLog, listCollection } from "@/lib/firebase/repository";
import { DEFAULT_ROLE_RECORDS, mergeWithSystemRole } from "@/lib/rbac";
import type { RoleRecord, UserRecord, UserStatus } from "@/types";

interface CreateUserValues {
  name: string;
  email: string;
  password?: string;
  roleId: string;
  status: UserStatus;
}

interface UpdateUserValues {
  id: string;
  name: string;
  email: string;
  password?: string;
  roleId: string;
  status: UserStatus;
}

export function useUsersManager() {
  const { sessionUser } = useSession();
  const { role, canAddUsers, canEditUsers, canViewUsers } = usePermissions();
  const [items, setItems] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [users, roleItems] = await Promise.all([
        listCollection<UserRecord>("users", { includeSystem: true }),
        listCollection<RoleRecord>("roles", { includeSystem: true }),
      ]);
      const mergedRoles = roleItems.map((roleRecord) => mergeWithSystemRole(roleRecord));
      DEFAULT_ROLE_RECORDS.forEach((defaultRole) => {
        if (!mergedRoles.some((item) => item.id === defaultRole.id)) {
          mergedRoles.push(defaultRole);
        }
      });
      setItems(users.sort((a, b) => a.name.localeCompare(b.name)));
      setRoles(mergedRoles.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !query || item.name.toLowerCase().includes(query) || item.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || item.roleId === roleFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [items, roleFilter, search, statusFilter]);

  const saveUser = async (values: CreateUserValues | UpdateUserValues) => {
    const canSaveUser = "id" in values && values.id ? canEditUsers : canAddUsers;
    if (!canSaveUser) {
      toast.error("You do not have permission to update user access");
      return false;
    }

    if ("id" in values && values.id === sessionUser?.uid && values.status === "inactive") {
      toast.error("You cannot deactivate your own account");
      return false;
    }

    setIsSaving(true);
    try {
      if (!("id" in values) || !values.id) {
        if (!values.password || values.password.length < 8) {
          throw new Error("Temporary password must be at least 8 characters");
        }

        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Unable to create user");
        }

        const created = (await response.json()) as UserRecord;
        await addActivityLog({
          action: "Created admin user",
          entity: "user",
          entityId: created.id,
          actorName: sessionUser?.name ?? "Current user",
          actorRole: role,
        });
        toast.success("User created");
      } else {
        const response = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? "Unable to update user");
        }

        const userId = values.id;
        await addActivityLog({
          action: "Updated user access",
          entity: "user",
          entityId: userId,
          actorName: sessionUser?.name ?? "Current user",
          actorRole: role,
        });
        toast.success("User updated");
      }

      setEditingUser(null);
      setSelectedIds([]);
      await load();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save user");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const bulkUpdateStatus = async (status: UserStatus) => {
    if (!selectedIds.length) {
      toast.error("Select at least one user first");
      return;
    }

    if (!canEditUsers) {
      toast.error("You do not have permission to manage users");
      return;
    }

    if (status === "inactive" && sessionUser?.uid && selectedIds.includes(sessionUser.uid)) {
      toast.error("You cannot deactivate your own account");
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch("/api/admin/users", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, status }),
          }).then(async (response) => {
            if (!response.ok) {
              const payload = (await response.json().catch(() => null)) as { error?: string } | null;
              throw new Error(payload?.error ?? "Unable to update users");
            }
          }),
        ),
      );

      await addActivityLog({
        action: `Bulk set users to ${status}`,
        entity: "user",
        entityId: selectedIds.join(","),
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success(`Selected users marked ${status}`);
      setSelectedIds([]);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete bulk action");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    items: filteredItems,
    allItems: items,
    roles,
    editingUser,
    setEditingUser,
    selectedIds,
    setSelectedIds,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    isLoading,
    isSaving,
    saveUser,
    bulkUpdateStatus,
    canViewUsers,
    canAddUsers,
    canEditUsers,
  };
}
