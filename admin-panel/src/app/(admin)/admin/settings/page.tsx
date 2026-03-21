"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CMS_FIELD_SECTIONS } from "@/features/cms/cms-fields";
import { useCmsManager } from "@/features/cms/hooks/use-cms-manager";
import { LivePreviewShell } from "@/features/preview/components/live-preview-shell";
import { useDebouncedPreview } from "@/hooks/use-debounced-preview";
import { usePermissions } from "@/hooks/use-permissions";
import { DEFAULT_CMS_CONTENT } from "@/lib/constants";
import { uploadImage } from "@/lib/firebase/repository";
import { usePreviewStore } from "@/store/preview-store";

type Values = typeof DEFAULT_CMS_CONTENT;

function CmsImageField({
  fieldKey,
  label,
  value,
  onChange,
  disabled = false,
}: {
  fieldKey: keyof Values;
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <FormField
      className="md:col-span-2"
      label={label}
      hint="Paste an image URL or upload a new optimized image directly into website content."
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <Input value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} />
        <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-3">
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm"
            disabled={disabled}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }

              setIsUploading(true);
              try {
                const nextUrl = await uploadImage(file, `cms/${String(fieldKey)}/${Date.now()}-${file.name}`);
                onChange(nextUrl);
                toast.success(`${label} uploaded`);
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Image upload failed");
              } finally {
                setIsUploading(false);
                event.target.value = "";
              }
            }}
          />
          <p className="text-xs text-muted-foreground">
            {isUploading ? "Optimizing image..." : "Upload replaces the URL field with a compressed website-ready image."}
          </p>
        </div>
      </div>
      {value ? (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
          <img src={value} alt={label} className="h-40 w-full object-cover" />
        </div>
      ) : null}
    </FormField>
  );
}

export default function SettingsPage() {
  const { content, isLoading, isSaving, save, canManageCms } = useCmsManager();
  const { role } = usePermissions();
  const [values, setValues] = useState<Values>(DEFAULT_CMS_CONTENT);
  const setCmsDraft = usePreviewStore((state) => state.setCmsDraft);
  const setSection = usePreviewStore((state) => state.setSection);

  useEffect(() => {
    if (content) {
      setValues({
        ...DEFAULT_CMS_CONTENT,
        ...content,
      } as Values);
      setCmsDraft(null);
    }
  }, [content, setCmsDraft]);

  useEffect(() => {
    setSection("homepage");
  }, [setSection]);

  useDebouncedPreview(values, setCmsDraft);

  const handleValueChange = (field: keyof Values, nextValue: string) => {
    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & CMS"
        description="Update homepage navigation, section copy, CTA labels, social links, contact details, and key homepage images from one place."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Website content management</CardTitle>
            <CardDescription>
              Doctors, services, reviews, and appointments already have their own modules. Use this screen to manage the
              homepage structure, hero navigation, and editable section copy.
            </CardDescription>
            {!canManageCms ? (
              <CardDescription className="text-amber-600 dark:text-amber-400">
                Signed in as {role}. This screen is read-only for staff accounts.
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton key={index} className="h-48 rounded-3xl" />
                ))}
              </div>
            ) : (
              <form
                className="space-y-6"
                onSubmit={async (event) => {
                  event.preventDefault();
                  const sanitized = Object.fromEntries(
                    Object.entries(values).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
                  ) as Values;
                  await save(sanitized);
                }}
              >
                <div className="grid gap-6">
                  {CMS_FIELD_SECTIONS.map((section) => (
                    <Card key={section.title} className="rounded-3xl">
                      <CardHeader>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 md:grid-cols-2">
                        {section.fields.map((field) => {
                          const value = values[field.key] ?? "";

                          if (field.kind === "image") {
                            return (
                              <CmsImageField
                                key={field.key}
                                fieldKey={field.key}
                                label={field.label}
                                value={value}
                                onChange={(nextValue) => handleValueChange(field.key, nextValue)}
                                disabled={!canManageCms}
                              />
                            );
                          }

                          if (field.kind === "textarea") {
                            return (
                              <FormField key={field.key} className="md:col-span-2" label={field.label} hint={field.hint}>
                                <Textarea
                                  value={value}
                                  onChange={(event) => handleValueChange(field.key, event.target.value)}
                                  disabled={!canManageCms}
                                />
                              </FormField>
                            );
                          }

                          return (
                            <FormField key={field.key} label={field.label} hint={field.hint}>
                              <Input
                                type={field.kind === "url" ? "url" : "text"}
                                value={value}
                                onChange={(event) => handleValueChange(field.key, event.target.value)}
                                disabled={!canManageCms}
                              />
                            </FormField>
                          );
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={() => {
                      setValues((content ?? DEFAULT_CMS_CONTENT) as Values);
                      setCmsDraft(null);
                    }}
                  >
                    Reset changes
                  </Button>
                  <Button disabled={isSaving || !canManageCms}>
                    {isSaving ? "Saving..." : canManageCms ? "Save website content" : "Admin access required"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <LivePreviewShell
          title="Homepage live preview"
          description="This preview uses your unsaved CMS copy first, then falls back to the saved Firebase content. Use it to review the whole homepage without publishing."
          allowedSections={["homepage", "hero", "services", "doctors", "reviews"]}
          seed={{
            cms: values,
          }}
          onReset={() => {
            setValues((content ?? DEFAULT_CMS_CONTENT) as Values);
            setCmsDraft(null);
          }}
        />
      </div>
    </div>
  );
}
