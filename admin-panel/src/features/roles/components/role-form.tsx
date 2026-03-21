"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PERMISSION_GROUPS } from "@/lib/rbac";
import type { RoleRecord, UserPermission } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().min(10),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

type Values = z.infer<typeof schema>;

export function RoleForm({
  role,
  isSaving,
  onCancel,
  onSave,
}: {
  role: RoleRecord | null;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (values: { id?: string; name: string; description: string; permissions: UserPermission[]; system?: boolean }) => Promise<boolean | void>;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissions: role?.permissions ?? [],
    },
  });

  useEffect(() => {
    form.reset({
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissions: role?.permissions ?? [],
    });
  }, [form, role]);

  const selectedPermissions = form.watch("permissions") ?? [];

  const togglePermission = (permission: UserPermission) => {
    const next = selectedPermissions.includes(permission)
      ? selectedPermissions.filter((item) => item !== permission)
      : [...selectedPermissions, permission];

    form.setValue("permissions", next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{role ? "Edit role" : "Add role"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(async (values) =>
            onSave({
              id: role?.id,
              name: values.name,
              description: values.description,
              permissions: values.permissions as UserPermission[],
              system: role?.system,
            }),
          )}
        >
          <FormField label="Role name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} disabled={Boolean(role?.system)} />
          </FormField>

          <FormField label="Description" error={form.formState.errors.description?.message}>
            <Textarea {...form.register("description")} disabled={Boolean(role?.system)} />
          </FormField>

          <div className="space-y-4">
            <p className="text-sm font-semibold">Permissions</p>
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.title} className="rounded-2xl border border-border/70 p-4">
                <p className="text-sm font-semibold">{group.title}</p>
                <div className="mt-3 grid gap-3">
                  {group.permissions.map((permission) => {
                    const checked = selectedPermissions.includes(permission.key);
                    return (
                      <label key={permission.key} className="flex items-start gap-3 rounded-2xl border border-border/60 p-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={Boolean(role?.system)}
                          onChange={() => togglePermission(permission.key)}
                          className="mt-1 h-4 w-4 rounded border-slate-300"
                        />
                        <div>
                          <p className="text-sm font-medium">{permission.label}</p>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={isSaving}>{isSaving ? "Saving..." : role ? "Save role" : "Create role"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
