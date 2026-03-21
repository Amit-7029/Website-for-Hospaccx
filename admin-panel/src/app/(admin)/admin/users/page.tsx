"use client";

import { useMemo } from "react";
import { Search, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { UserForm } from "@/features/users/components/user-form";
import { useUsersManager } from "@/features/users/hooks/use-users-manager";

export default function UsersPage() {
  const {
    items,
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
    canAddUsers,
    canEditUsers,
  } = useUsersManager();

  const selectedCount = selectedIds.length;
  const roleMap = useMemo(() => new Map(roles.map((role) => [role.id, role.name])), [roles]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & Access"
        description="Create users, assign dynamic roles, and activate or deactivate access safely."
        action={canAddUsers ? { label: "Add user", onClick: () => setEditingUser(null) } : undefined}
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr,0.85fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-[1fr,220px,180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" placeholder="Search users..." />
              </div>
              <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                <option value="all">All roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary">{selectedCount} selected</Badge>
              <Button variant="outline" size="sm" disabled={!canEditUsers || !selectedCount || isSaving} onClick={() => void bulkUpdateStatus("active")}>
                Mark active
              </Button>
              <Button variant="outline" size="sm" disabled={!canEditUsers || !selectedCount || isSaving} onClick={() => void bulkUpdateStatus("inactive")}>
                Mark inactive
              </Button>
            </div>

            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-16 rounded-2xl" />)
            ) : items.length ? (
              <div className="overflow-hidden rounded-3xl border">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        <th className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={items.length > 0 && selectedIds.length === items.length}
                            onChange={(event) => setSelectedIds(event.target.checked ? items.map((item) => item.id) : [])}
                          />
                        </th>
                        <th className="px-4 py-3 font-semibold">User</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((user) => {
                        const checked = selectedIds.includes(user.id);
                        return (
                          <tr key={user.id} className="border-t">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) =>
                                  setSelectedIds((current) =>
                                    event.target.checked ? [...current, user.id] : current.filter((item) => item !== user.id),
                                  )
                                }
                              />
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </td>
                            <td className="px-4 py-3">{user.roleName ?? roleMap.get(user.roleId ?? "") ?? user.role}</td>
                            <td className="px-4 py-3">
                              <Badge variant={user.status === "active" ? "success" : "warning"}>{user.status}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Button variant="outline" size="sm" onClick={() => setEditingUser(user)} disabled={!canEditUsers}>
                                Edit
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState icon={Users} title="No users found" description="Create your first user and assign a role to start access management." />
            )}
          </CardContent>
        </Card>

        <UserForm
          user={editingUser}
          roles={roles}
          isSaving={isSaving}
          onCancel={() => setEditingUser(null)}
          onSave={saveUser}
        />
      </div>
    </div>
  );
}
