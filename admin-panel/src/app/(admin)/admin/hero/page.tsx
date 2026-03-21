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
import { LivePreviewShell } from "@/features/preview/components/live-preview-shell";
import { useHeroManager } from "@/features/hero/hooks/use-hero-manager";
import { useDebouncedPreview } from "@/hooks/use-debounced-preview";
import { DEFAULT_HERO_CONTENT } from "@/lib/constants";
import { uploadImage } from "@/lib/firebase/repository";
import { usePreviewStore } from "@/store/preview-store";
import type { HeroContent } from "@/types";

const heroSchema = z.object({
  heading: z.string().trim().min(5, "Heading is required"),
  subheading: z.string().trim().min(5, "Subheading is required"),
  primaryButtonText: z.string().trim().min(2, "Primary button text is required"),
  secondaryButtonText: z.string().trim().min(2, "Secondary button text is required"),
  primaryButtonLink: z.string().trim().min(1, "Primary button link is required"),
  secondaryButtonLink: z.string().trim().min(1, "Secondary button link is required"),
  imageUrl: z.string().trim().min(1, "Hero image is required"),
  backgroundImageUrl: z.string().trim().min(1, "Background image is required"),
  overlayOpacity: z.number().min(0.3, "Overlay opacity must be at least 0.3").max(0.7, "Overlay opacity must be 0.7 or less"),
  overlayColor: z.string().trim().min(4, "Overlay color is required"),
});

type HeroFormValues = z.infer<typeof heroSchema>;

export default function HeroEditorPage() {
  const { content, isLoading, isSaving, save, canManageCms } = useHeroManager();
  const [isUploading, setIsUploading] = useState(false);
  const setHeroDraft = usePreviewStore((state) => state.setHeroDraft);
  const setSection = usePreviewStore((state) => state.setSection);
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
        backgroundImageUrl: content.backgroundImageUrl,
        overlayOpacity: content.overlayOpacity,
        overlayColor: content.overlayColor,
      });
      setHeroDraft(null);
    }
  }, [content, form, setHeroDraft]);

  useEffect(() => {
    setSection("hero");
  }, [setSection]);

  const imageUrl = form.watch("imageUrl");
  const backgroundImageUrl = form.watch("backgroundImageUrl");
  const overlayOpacity = form.watch("overlayOpacity");
  const overlayColor = form.watch("overlayColor");
  const previewValues = form.watch();

  useDebouncedPreview(
    {
      ...previewValues,
      heading: previewValues.heading || DEFAULT_HERO_CONTENT.heading,
      subheading: previewValues.subheading || DEFAULT_HERO_CONTENT.subheading,
      primaryButtonText: previewValues.primaryButtonText || DEFAULT_HERO_CONTENT.primaryButtonText,
      secondaryButtonText: previewValues.secondaryButtonText || DEFAULT_HERO_CONTENT.secondaryButtonText,
      primaryButtonLink: previewValues.primaryButtonLink || DEFAULT_HERO_CONTENT.primaryButtonLink,
      secondaryButtonLink: previewValues.secondaryButtonLink || DEFAULT_HERO_CONTENT.secondaryButtonLink,
      imageUrl: previewValues.imageUrl || DEFAULT_HERO_CONTENT.imageUrl,
      backgroundImageUrl: previewValues.backgroundImageUrl || DEFAULT_HERO_CONTENT.backgroundImageUrl,
      overlayOpacity: previewValues.overlayOpacity ?? DEFAULT_HERO_CONTENT.overlayOpacity,
      overlayColor: previewValues.overlayColor || DEFAULT_HERO_CONTENT.overlayColor,
    },
    setHeroDraft,
  );

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
        description="Control the homepage hero heading, buttons, right-side image, and premium background overlay from Firestore content/hero. For multiple background slides, use Media Library and choose section Hero."
      />

      <Card>
        <CardHeader>
          <CardTitle>Homepage hero content</CardTitle>
          <CardDescription>
            Changes here update the live hero section on the website. The editor writes to the Firestore
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">content/hero</code>
            document.
          </CardDescription>
          <CardDescription>
            Multiple rotating hero backgrounds are managed from
            <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">Media Library → Hero</code>.
            The background image field here works as the safe fallback when no hero slides are available.
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

                <FormField label="Upload / replace hero image" hint="Optimizes the image and stores it directly in website content without Firebase Storage.">
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
                  <p className="text-xs text-muted-foreground">{isUploading ? "Optimizing hero image..." : "Best results: wide landscape image. Large files are auto-compressed before save."}</p>
                </FormField>

                <FormField label="Background image URL" error={form.formState.errors.backgroundImageUrl?.message}>
                  <Input {...form.register("backgroundImageUrl")} disabled={!canManageCms} />
                </FormField>

                <FormField label="Upload / replace background image" hint="This image is optimized and saved directly for the full hero background.">
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

                      setIsUploading(true);
                      try {
                        const nextUrl = await uploadImage(file, `hero/background-${Date.now()}-${file.name}`);
                        form.setValue("backgroundImageUrl", nextUrl, { shouldDirty: true, shouldValidate: true });
                        toast.success("Hero background uploaded");
                      } catch (error) {
                        toast.error(error instanceof Error ? error.message : "Background upload failed");
                      } finally {
                        setIsUploading(false);
                        event.target.value = "";
                      }
                    }}
                  />
                </FormField>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
                  <FormField label="Overlay opacity" hint="Recommended range: 0.3 to 0.7" error={form.formState.errors.overlayOpacity?.message}>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0.3"
                        max="0.7"
                        step="0.05"
                        value={overlayOpacity ?? DEFAULT_HERO_CONTENT.overlayOpacity}
                        disabled={!canManageCms}
                        onChange={(event) => form.setValue("overlayOpacity", Number(event.target.value), { shouldDirty: true, shouldValidate: true })}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">Current opacity: {Number(overlayOpacity ?? DEFAULT_HERO_CONTENT.overlayOpacity).toFixed(2)}</p>
                    </div>
                  </FormField>

                  <FormField label="Overlay color" error={form.formState.errors.overlayColor?.message}>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={overlayColor || DEFAULT_HERO_CONTENT.overlayColor}
                        disabled={!canManageCms}
                        onChange={(event) => form.setValue("overlayColor", event.target.value, { shouldDirty: true, shouldValidate: true })}
                        className="h-11 w-14 rounded-xl border border-border bg-transparent p-1"
                      />
                      <Input value={overlayColor || DEFAULT_HERO_CONTENT.overlayColor} readOnly />
                    </div>
                  </FormField>
                </div>

                <div className="flex justify-end">
                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSaving || isUploading}
                      onClick={() => {
                        form.reset(content ?? DEFAULT_HERO_CONTENT);
                        setHeroDraft(null);
                      }}
                    >
                      Reset changes
                    </Button>
                    <Button type="submit" disabled={isSaving || isUploading || !canManageCms}>
                      {isSaving ? "Saving..." : canManageCms ? "Save hero section" : "Admin access required"}
                    </Button>
                  </div>
                </div>
              </div>

              <LivePreviewShell
                title="Hero live preview"
                description="Type on the left and we’ll mirror the hero instantly. Draft mode keeps your unsaved hero changes separate from Firebase until you save."
                allowedSections={["hero", "homepage"]}
                seed={{
                  hero: {
                    heading: previewValues.heading || DEFAULT_HERO_CONTENT.heading,
                    subheading: previewValues.subheading || DEFAULT_HERO_CONTENT.subheading,
                    primaryButtonText: previewValues.primaryButtonText || DEFAULT_HERO_CONTENT.primaryButtonText,
                    secondaryButtonText: previewValues.secondaryButtonText || DEFAULT_HERO_CONTENT.secondaryButtonText,
                    primaryButtonLink: previewValues.primaryButtonLink || DEFAULT_HERO_CONTENT.primaryButtonLink,
                    secondaryButtonLink: previewValues.secondaryButtonLink || DEFAULT_HERO_CONTENT.secondaryButtonLink,
                    imageUrl,
                    backgroundImageUrl,
                    overlayOpacity,
                    overlayColor,
                  } as HeroContent,
                }}
                onReset={() => {
                  form.reset(content ?? DEFAULT_HERO_CONTENT);
                  setHeroDraft(null);
                }}
              />
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
