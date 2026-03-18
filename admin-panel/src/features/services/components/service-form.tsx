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
import type { DiagnosticService } from "@/types";

const schema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  icon: z.string().min(2),
  category: z.string().min(2),
});

type Values = z.infer<typeof schema>;

export function ServiceForm({
  service,
  onCancel,
  onSave,
  isSaving,
}: {
  service: DiagnosticService | null;
  onCancel: () => void;
  onSave: (values: Values) => Promise<void>;
  isSaving: boolean;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: service?.title ?? "",
      description: service?.description ?? "",
      icon: service?.icon ?? "",
      category: service?.category ?? "Laboratory",
    },
  });

  useEffect(() => {
    form.reset({
      title: service?.title ?? "",
      description: service?.description ?? "",
      icon: service?.icon ?? "",
      category: service?.category ?? "Laboratory",
    });
  }, [service, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{service ? "Edit service" : "Add service"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => onSave(values))}>
          <FormField label="Title" error={form.formState.errors.title?.message}>
            <Input {...form.register("title")} placeholder="Clinical Biochemistry" />
          </FormField>
          <FormField label="Description" error={form.formState.errors.description?.message}>
            <Textarea {...form.register("description")} placeholder="Short, patient-friendly description." />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Icon name" hint="Use a Lucide icon name like FlaskConical" error={form.formState.errors.icon?.message}>
              <Input {...form.register("icon")} placeholder="FlaskConical" />
            </FormField>
            <FormField label="Category" error={form.formState.errors.category?.message}>
              <Input {...form.register("category")} placeholder="Laboratory" />
            </FormField>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={isSaving}>{isSaving ? "Saving..." : service ? "Save changes" : "Add service"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
