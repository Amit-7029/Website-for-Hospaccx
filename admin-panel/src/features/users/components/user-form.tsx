"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { RoleRecord, UserRecord } from "@/types";

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().optional(),
  roleId: z.string().trim().min(2),
  status: z.enum(["active", "inactive"]),
});

type Values = z.infer<typeof schema>;

export function UserForm({
  user,
  roles,
  isSaving,
  onCancel,
  onSave,
}: {
  user: UserRecord | null;
  roles: RoleRecord[];
  isSaving: boolean;
  onCancel: () => void;
  onSave: (values: Values & { id?: string }) => Promise<boolean | void>;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      roleId: user?.roleId ?? roles[0]?.id ?? "",
      status: user?.status ?? "active",
    },
  });

  useEffect(() => {
    form.reset({
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      roleId: user?.roleId ?? roles[0]?.id ?? "",
      status: user?.status ?? "active",
    });
  }, [form, roles, user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user ? "Edit user access" : "Add user"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            if (!user && (!values.password || values.password.length < 8)) {
              form.setError("password", {
                type: "manual",
                message: "Temporary password must be at least 8 characters",
              });
              return;
            }

            const payload = user
              ? {
                  id: user.id,
                  name: values.name,
                  email: values.email,
                  roleId: values.roleId,
                  status: values.status,
                }
              : {
                  ...values,
                  password: values.password ?? "",
                };

            await onSave(payload);
          })}
        >
          <FormField label="Full name" error={form.formState.errors.name?.message}>
            <Input {...form.register("name")} />
          </FormField>
          <FormField label="Email address" error={form.formState.errors.email?.message}>
            <Input type="email" {...form.register("email")} disabled={Boolean(user)} />
          </FormField>
          {!user ? (
            <FormField label="Temporary password" hint="User can change this later in Firebase Auth." error={form.formState.errors.password?.message}>
              <Input type="password" {...form.register("password")} />
            </FormField>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Assigned role" error={form.formState.errors.roleId?.message}>
              <Select {...form.register("roleId")}>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Status" error={form.formState.errors.status?.message}>
              <Select {...form.register("status")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={isSaving}>{isSaving ? "Saving..." : user ? "Save user" : "Create user"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
