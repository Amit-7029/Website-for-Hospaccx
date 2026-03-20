"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MediaItem } from "@/types";

const schema = z.object({
  title: z.string().min(2),
  caption: z.string().min(2),
  alt: z.string().min(2),
  imageUrl: z.string().optional(),
  section: z.enum(["hero", "highlights", "gallery", "whyChoose", "healthcare", "pharmacies", "services"]),
  category: z.string().min(2),
  ctaLabel: z.string().optional(),
  ctaLink: z.string().optional(),
  order: z.coerce.number().int().min(0).max(999),
});

type FormValues = z.input<typeof schema>;
type SubmitValues = z.output<typeof schema>;

const SECTION_OPTIONS: Array<{ value: MediaItem["section"]; label: string }> = [
  { value: "hero", label: "Hero" },
  { value: "highlights", label: "Inside Our Center" },
  { value: "whyChoose", label: "Why Choose Us" },
  { value: "healthcare", label: "Complete Healthcare" },
  { value: "pharmacies", label: "Pharmacies" },
  { value: "services", label: "Diagnostic Services" },
  { value: "gallery", label: "Gallery" },
];

export function MediaForm({
  item,
  onCancel,
  onSave,
  isSaving,
}: {
  item: MediaItem | null;
  onCancel: () => void;
  onSave: (values: SubmitValues & { imageFile?: File | null; imageUrl?: string }) => Promise<void>;
  isSaving: boolean;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const form = useForm<FormValues, unknown, SubmitValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: item?.title ?? "",
      caption: item?.caption ?? "",
      alt: item?.alt ?? "",
      imageUrl: item?.imageUrl ?? "",
      section: item?.section ?? "gallery",
      category: item?.category ?? "Infrastructure",
      ctaLabel: item?.ctaLabel ?? "",
      ctaLink: item?.ctaLink ?? "",
      order: item?.order ?? 1,
    },
  });

  useEffect(() => {
    form.reset({
      title: item?.title ?? "",
      caption: item?.caption ?? "",
      alt: item?.alt ?? "",
      imageUrl: item?.imageUrl ?? "",
      section: item?.section ?? "gallery",
      category: item?.category ?? "Infrastructure",
      ctaLabel: item?.ctaLabel ?? "",
      ctaLink: item?.ctaLink ?? "",
      order: item?.order ?? 1,
    });
    setImageFile(null);
  }, [form, item]);

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : form.watch("imageUrl") || item?.imageUrl;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? "Edit media asset" : "Add media asset"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) =>
            onSave({
              ...values,
              imageFile,
              imageUrl: values.imageUrl || item?.imageUrl,
            }),
          )}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Title" error={form.formState.errors.title?.message}>
              <Input {...form.register("title")} placeholder="Reception & Patient Helpdesk" />
            </FormField>
            <FormField label="Display order" error={form.formState.errors.order?.message}>
              <Input type="number" min={0} max={999} {...form.register("order")} />
            </FormField>
          </div>

          <FormField label="Caption" error={form.formState.errors.caption?.message}>
            <Textarea {...form.register("caption")} placeholder="Short patient-friendly copy for this image card." />
          </FormField>

          <FormField label="Alt text" error={form.formState.errors.alt?.message}>
            <Input {...form.register("alt")} placeholder="Reception area at Banerjee Diagnostic Foundation and Hospaccx" />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Section" error={form.formState.errors.section?.message}>
              <Select {...form.register("section")}>
                {SECTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Category" error={form.formState.errors.category?.message}>
              <Input {...form.register("category")} placeholder="Why Choose Us, Pharmacy, Laboratory..." />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="CTA label">
              <Input {...form.register("ctaLabel")} placeholder="Book Appointment" />
            </FormField>
            <FormField label="CTA link">
              <Input {...form.register("ctaLink")} placeholder="#appointment or https://..." />
            </FormField>
          </div>

          <FormField label="Image URL" hint="You can paste a URL or upload a new image file.">
            <Input {...form.register("imageUrl")} placeholder="https://... or upload a new image" />
          </FormField>

          <FormField label="Upload image">
            <Input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
          </FormField>

          {previewUrl ? (
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
              <div className="relative h-52 w-full">
                <Image src={previewUrl} alt={form.watch("alt") || form.watch("title")} fill className="object-cover" unoptimized />
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button disabled={isSaving}>{isSaving ? "Saving..." : item ? "Save changes" : "Add media"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
