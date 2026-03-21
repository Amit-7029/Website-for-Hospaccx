"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useHeroManager } from "@/features/hero/hooks/use-hero-manager";
import { DEFAULT_HERO_CONTENT } from "@/lib/constants";
import { uploadImage } from "@/lib/firebase/repository";
import type { HeroContent } from "@/types";

const heroSchema = z.object({
  heading: z.string().trim().min(5, "Heading is required"),
  subheading: z.string().trim().min(5, "Subheading is required"),
  primaryButtonText: z.string().trim().min(2, "Primary button text is required"),
  secondaryButtonText: z.string().trim().min(2, "Secondary button text is required"),
  primaryButtonLink: z.string().trim().min(1, "Primary button link is required"),
  secondaryButtonLink: z.string().trim().min(1, "Secondary button link is required"),
  imageUrl: z.string().trim().min(1, "Hero image is required"),
});

type HeroFormValues = z.infer<typeof heroSchema>;

export default function HeroEditorPage() {
  const { content, isLoading, isSaving, save, canManageCms } = useHeroManager();
  const [isUploading, setIsUploading] = useState(false);
  const form = useForm<HeroFormValues>({
    resolver: zodResolver(heroSchema),
    defaultValues: DEFAULT_HERO_CONTENT,
  });

  useEffect(() => {
    if (content) {
      form.reset({
        heading: content.heading,
        subheading: content.subheading,
        primaryButtonText: content.primaryButtonText,
        secondaryButtonText: content.secondaryButtonText,
        primaryButtonLink: content.primaryButtonLink,
        secondaryButtonLink: content.secondaryButtonLink,
        imageUrl: content.imageUrl,
      });
    }
  }, [content, form]);

  const imageUrl = form.watch("imageUrl");

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const nextUrl = await uploadImage(file, `hero/${Date.now()}-${file.name}`);
      form.setValue("imageUrl", nextUrl, { shouldDirty: true, shouldValidate: true });
      toast.success("Hero image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hero Section Editor"
        description="Control the homepage hero heading, subheading, CTA buttons, and right-side image from Firestore content/hero."
      />

      <Card>
        <CardHeader>
          <CardTitle>Homepage hero content</CardTitle>
          <CardDescription>
            Changes here update the live hero section on the website. The editor writes to the Firestore
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">content/hero</code>
            document.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-3xl" />
                ))}
              </div>
              <Skeleton className="h-[420px] rounded-3xl" />
            </div>
          ) : (
            <form
              className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]"
              onSubmit={form.handleSubmit(async (values) => {
                await save(values as HeroContent);
              })}
            >
              <div className="space-y-5">
                <FormField label="Heading" error={form.formState.errors.heading?.message}>
                  <Textarea {...form.register("heading")} disabled={!canManageCms} />
                </FormField>

                <FormField label="Subheading" error={form.formState.errors.subheading?.message}>
                  <Textarea {...form.register("subheading")} disabled={!canManageCms} />
                </FormField>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Primary button text" error={form.formState.errors.primaryButtonText?.message}>
                    <Input {...form.register("primaryButtonText")} disabled={!canManageCms} />
                  </FormField>
                  <FormField label="Secondary button text" error={form.formState.errors.secondaryButtonText?.message}>
                    <Input {...form.register("secondaryButtonText")} disabled={!canManageCms} />
                  </FormField>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Primary button link" hint="Examples: #appointment or /contact.html" error={form.formState.errors.primaryButtonLink?.message}>
                    <Input {...form.register("primaryButtonLink")} disabled={!canManageCms} />
                  </FormField>
                  <FormField label="Secondary button link" hint="Examples: tel:+919732029834 or #contact" error={form.formState.errors.secondaryButtonLink?.message}>
                    <Input {...form.register("secondaryButtonLink")} disabled={!canManageCms} />
                  </FormField>
                </div>

                <FormField label="Hero image URL" error={form.formState.errors.imageUrl?.message}>
                  <Input {...form.register("imageUrl")} disabled={!canManageCms} />
                </FormField>

                <FormField label="Upload / replace hero image" hint="Uploads to Firebase Storage and updates the image URL field automatically.">
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm"
                    disabled={!canManageCms || isUploading}
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        return;
                      }

                      await handleFileUpload(file);
                      event.target.value = "";
                    }}
                  />
                  <p className="text-xs text-muted-foreground">{isUploading ? "Uploading hero image..." : "Best results: wide landscape image under 1 MB."}</p>
                </FormField>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving || isUploading || !canManageCms}>
                    {isSaving ? "Saving..." : canManageCms ? "Save hero section" : "Admin access required"}
                  </Button>
                </div>
              </div>

              <Card className="overflow-hidden rounded-[28px] border-border/70">
                <div className="bg-gradient-to-br from-sky-100 via-white to-indigo-100 p-4">
                  <div className="overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-soft">
                    <div className="aspect-[4/4.4] overflow-hidden bg-muted">
                      <img
                        src={imageUrl || DEFAULT_HERO_CONTENT.imageUrl}
                        alt="Hero preview"
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = DEFAULT_HERO_CONTENT.imageUrl;
                        }}
                      />
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Live preview</p>
                        <h3 className="text-2xl font-semibold leading-tight text-foreground">
                          {form.watch("heading") || DEFAULT_HERO_CONTENT.heading}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {form.watch("subheading") || DEFAULT_HERO_CONTENT.subheading}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                          {form.watch("primaryButtonText") || DEFAULT_HERO_CONTENT.primaryButtonText}
                        </span>
                        <span className="inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground">
                          {form.watch("secondaryButtonText") || DEFAULT_HERO_CONTENT.secondaryButtonText}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
