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
import { Textarea } from "@/components/ui/textarea";
import type { CareerJob } from "@/types";

const schema = z.object({
  title: z.string().trim().min(3, "Job title is required"),
  department: z.string().trim().min(2, "Department is required"),
  location: z.string().trim().min(2, "Location is required"),
  experience: z.string().trim().min(2, "Experience is required"),
  jobType: z.enum(["full-time", "part-time", "contract", "internship"]),
  shortDescription: z.string().trim().min(20, "Short description should be at least 20 characters").max(180, "Keep the short description under 180 characters"),
  description: z.string().trim().min(60, "Full description should be at least 60 characters"),
  requirements: z.string().trim().min(20, "Add at least one requirement"),
  status: z.enum(["active", "inactive"]),
});

export type CareerJobFormValues = z.infer<typeof schema>;

export function JobForm({
  job,
  isSaving,
  onCancel,
  onSave,
}: {
  job: CareerJob | null;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (values: CareerJobFormValues & { id?: string }) => Promise<boolean | void>;
}) {
  const form = useForm<CareerJobFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: job?.title ?? "",
      department: job?.department ?? "",
      location: job?.location ?? "",
      experience: job?.experience ?? "",
      jobType: job?.jobType ?? "full-time",
      shortDescription: job?.shortDescription ?? "",
      description: job?.description ?? "",
      requirements: job?.requirements?.join("\n") ?? "",
      status: job?.status ?? "active",
    },
  });

  useEffect(() => {
    form.reset({
      title: job?.title ?? "",
      department: job?.department ?? "",
      location: job?.location ?? "",
      experience: job?.experience ?? "",
      jobType: job?.jobType ?? "full-time",
      shortDescription: job?.shortDescription ?? "",
      description: job?.description ?? "",
      requirements: job?.requirements?.join("\n") ?? "",
      status: job?.status ?? "active",
    });
  }, [form, job]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{job ? "Edit job opening" : "Add job opening"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await onSave({
              ...values,
              id: job?.id,
              requirements: values.requirements,
            });
          })}
        >
          <FormField label="Job title" error={form.formState.errors.title?.message}>
            <Input {...form.register("title")} placeholder="Senior Lab Technician" />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Department" error={form.formState.errors.department?.message}>
              <Input {...form.register("department")} placeholder="Clinical Pathology" />
            </FormField>
            <FormField label="Location" error={form.formState.errors.location?.message}>
              <Input {...form.register("location")} placeholder="Sainthia, Birbhum" />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField label="Experience" error={form.formState.errors.experience?.message}>
              <Input {...form.register("experience")} placeholder="2+ years" />
            </FormField>
            <FormField label="Job type" error={form.formState.errors.jobType?.message}>
              <Select {...form.register("jobType")}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </Select>
            </FormField>
            <FormField label="Status" error={form.formState.errors.status?.message}>
              <Select {...form.register("status")}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Short description" hint="Shown on career listing cards." error={form.formState.errors.shortDescription?.message}>
            <Textarea {...form.register("shortDescription")} placeholder="Short overview of the role, scope, and ideal fit." />
          </FormField>

          <FormField label="Full description" error={form.formState.errors.description?.message}>
            <Textarea {...form.register("description")} rows={6} placeholder="Detailed role summary, responsibilities, and why the role matters." />
          </FormField>

          <FormField label="Requirements" hint="One requirement per line." error={form.formState.errors.requirements?.message}>
            <Textarea {...form.register("requirements")} rows={6} placeholder={"Bachelor's degree in relevant field\nStrong patient communication\nExperience with diagnostic workflow"} />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={isSaving}>{isSaving ? "Saving..." : job ? "Save job" : "Add job"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
