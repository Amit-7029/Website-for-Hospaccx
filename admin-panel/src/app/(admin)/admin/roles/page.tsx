"use client";

import { ShieldCheck, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleForm } from "@/features/roles/components/role-form";
import { useRolesManager } from "@/features/roles/hooks/use-roles-manager";

export default function RolesPage() {
  const {
    items,
    editingRole,
    setEditingRole,
    roleToDelete,
    setRoleToDelete,
    isLoading,
    isSaving,
    saveRole,
    removeRole,
    canAddRoles,
    canDeleteRoles,
    canEditRoles,
  } = useRolesManager();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Create dynamic roles, define permission bundles, and keep access management scalable."
        action={canAddRoles ? { label: "Add role", onClick: () => setEditingRole(null) } : undefined}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.9fr]">
        <Card>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-56 rounded-3xl" />)
            ) : items.length ? (
              items.map((roleItem) => (
                <Card key={roleItem.id} className="border bg-background/50 shadow-none">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{roleItem.name}</h3>
                          {roleItem.system ? <Badge variant="secondary">System</Badge> : null}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{roleItem.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {roleItem.permissions.map((permission) => (
                        <Badge key={permission} variant="outline">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      {canEditRoles ? (
                        <Button variant="outline" className="flex-1" onClick={() => setEditingRole(roleItem)}>
                          Edit
                        </Button>
                      ) : null}
                      {!roleItem.system ? (
                        <Button variant="destructive" size="icon" onClick={() => setRoleToDelete(roleItem)} disabled={!canDeleteRoles}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="md:col-span-2">
                <EmptyState
                  icon={ShieldCheck}
                  title="No roles available"
                  description="Create your first permission bundle to start assigning dynamic access."
                />
              </div>
            )}
          </CardContent>
        </Card>

        <RoleForm role={editingRole} isSaving={isSaving} onCancel={() => setEditingRole(null)} onSave={saveRole} />
      </div>

      <ConfirmDialog
        open={Boolean(roleToDelete)}
        title="Delete role?"
        description="Only custom roles without assigned users can be removed."
        destructive
        confirmLabel="Delete role"
        onClose={() => setRoleToDelete(null)}
        onConfirm={() => void removeRole()}
      />
    </div>
  );
}
