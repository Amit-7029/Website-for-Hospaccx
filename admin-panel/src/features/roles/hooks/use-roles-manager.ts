"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { addActivityLog, deleteDocument, listCollection, saveDocument } from "@/lib/firebase/repository";
import { DEFAULT_ROLE_RECORDS, inferRoleFromPermissions, mergeWithSystemRole } from "@/lib/rbac";
import type { RoleRecord, UserRecord } from "@/types";

export function useRolesManager() {
  const { sessionUser } = useSession();
  const { role, canAddRoles, canDeleteRoles, canEditRoles, canViewRoles } = usePermissions();
  const [items, setItems] = useState<RoleRecord[]>([]);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const roles = await listCollection<RoleRecord>("roles", { includeSystem: true });
      const nextRoles = roles.map((roleRecord) => mergeWithSystemRole(roleRecord));
      DEFAULT_ROLE_RECORDS.forEach((defaultRole) => {
        if (!nextRoles.some((item) => item.id === defaultRole.id)) {
          nextRoles.push(defaultRole);
        }
      });
      setItems(nextRoles.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load roles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveRole = async (roleRecord: {
    id?: string;
    name: string;
    description: string;
    permissions: RoleRecord["permissions"];
    system?: boolean;
  }) => {
    const canSaveRole = editingRole ? canEditRoles : canAddRoles;
    if (!canSaveRole) {
      toast.error(editingRole ? "You do not have permission to edit roles" : "You do not have permission to add roles");
      return false;
    }

    setIsSaving(true);
    try {
      const saved = await saveDocument("roles", {
        ...roleRecord,
        id: editingRole?.id ?? roleRecord.id,
        system: editingRole?.system ?? roleRecord.system ?? false,
        createdAt: editingRole?.createdAt,
      });

      // Keep assigned user documents aligned with the current role definition so
      // Firestore rules and session refreshes stay consistent.
      const assignedUsers = (await listCollection<UserRecord>("users", { includeSystem: true })).filter(
        (user) => user.roleId === saved.id,
      );

      if (assignedUsers.length) {
        const nextRole = inferRoleFromPermissions(saved.permissions);
        await Promise.all(
          assignedUsers.map((user) =>
            saveDocument("users", {
              ...user,
              id: user.id,
              role: nextRole,
              roleId: saved.id,
              roleName: saved.name,
              permissions: saved.permissions,
              createdAt: user.createdAt,
            }),
          ),
        );
      }

      await addActivityLog({
        action: editingRole ? "Updated role permissions" : "Created role",
        entity: "role",
        entityId: saved.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });

      toast.success(editingRole ? "Role updated" : "Role created");
      setEditingRole(null);
      await load();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save role");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const removeRole = async () => {
    if (!canDeleteRoles) {
      toast.error("You do not have permission to delete roles");
      return;
    }

    if (!roleToDelete) {
      return;
    }

    if (roleToDelete.system) {
      toast.error("System roles cannot be deleted");
      return;
    }

    try {
      const users = await listCollection<UserRecord>("users", { includeSystem: true });
      const assignedUsers = users.filter((user) => user.roleId === roleToDelete.id);
      if (assignedUsers.length) {
        toast.error("This role is still assigned to one or more users");
        return;
      }

      await deleteDocument("roles", roleToDelete.id);
      await addActivityLog({
        action: "Deleted role",
        entity: "role",
        entityId: roleToDelete.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success("Role deleted");
      setRoleToDelete(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete role");
    }
  };

  return {
    items,
    editingRole,
    setEditingRole,
    roleToDelete,
    setRoleToDelete,
    isLoading,
    isSaving,
    saveRole,
    removeRole,
    canViewRoles,
    canAddRoles,
    canEditRoles,
    canDeleteRoles,
  };
}
