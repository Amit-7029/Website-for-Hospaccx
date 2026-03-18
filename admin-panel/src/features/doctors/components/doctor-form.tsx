"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import type { Doctor } from "@/types";

const schema = z.object({
  name: z.string().min(2),
  qualification: z.string().min(2),
  specialization: z.string().min(2),
  department: z.string().min(2),
  availability: z.string().min(2),
  description: z.string().min(10),
  services: z.string().min(5),
});

type Values = z.infer<typeof schema>;

export function DoctorForm({
  doctor,
  onCancel,
  onSave,
  isSaving,
}: {
  doctor: Doctor | null;
  onCancel: () => void;
  onSave: (values: Values & { imageFile?: File | null; imageUrl?: string }) => Promise<void>;
  isSaving: boolean;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: doctor?.name ?? "",
      qualification: doctor?.qualification ?? "",
      specialization: doctor?.specialization ?? "",
      department: doctor?.department ?? "",
      availability: doctor?.availability.join("\n") ?? "",
      description: doctor?.description ?? "",
      services: doctor?.services.join("\n") ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      name: doctor?.name ?? "",
      qualification: doctor?.qualification ?? "",
      specialization: doctor?.specialization ?? "",
      department: doctor?.department ?? "",
      availability: doctor?.availability.join("\n") ?? "",
      description: doctor?.description ?? "",
      services: doctor?.services.join("\n") ?? "",
    });
    setImageFile(null);
  }, [doctor, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{doctor ? "Edit doctor" : "Add new doctor"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(async (values) => {
            await onSave({
              ...values,
              availability: values.availability.split("\n").map((item) => item.trim()).filter(Boolean).join("\n"),
              services: values.services.split("\n").map((item) => item.trim()).filter(Boolean).join("\n"),
              imageFile,
              imageUrl: doctor?.imageUrl,
            } as Values & { imageFile?: File | null; imageUrl?: string });
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Doctor name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Dr. Nirmita Saha" />
            </FormField>
            <FormField label="Qualification" error={form.formState.errors.qualification?.message}>
              <Input {...form.register("qualification")} placeholder="M.B.B.S., M.S. (Obs & Gynae)" />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Specialization" error={form.formState.errors.specialization?.message}>
              <Input {...form.register("specialization")} placeholder="Gynecology Specialist" />
            </FormField>
            <FormField label="Department" error={form.formState.errors.department?.message}>
              <Input {...form.register("department")} placeholder="Gynecology" />
            </FormField>
          </div>

          <FormField label="Availability" hint="One schedule entry per line" error={form.formState.errors.availability?.message}>
            <Textarea {...form.register("availability")} placeholder={"Sunday: 4:00 PM\nThursday: 10:00 AM"} />
          </FormField>

          <FormField label="Description" error={form.formState.errors.description?.message}>
            <Textarea {...form.register("description")} placeholder="Short doctor profile for website and admin view." />
          </FormField>

          <FormField label="Services" hint="One service per line" error={form.formState.errors.services?.message}>
            <Textarea {...form.register("services")} placeholder={"Pregnancy and maternity care\nInfertility treatment"} />
          </FormField>

          <FormField label="Doctor image">
            <Input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={isSaving}>{isSaving ? "Saving..." : doctor ? "Save changes" : "Add doctor"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
