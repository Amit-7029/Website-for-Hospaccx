"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions } from "@/hooks/use-permissions";
import { useCmsManager } from "@/features/cms/hooks/use-cms-manager";
import { DEFAULT_CMS_CONTENT } from "@/lib/constants";

type SeoValues = Pick<typeof DEFAULT_CMS_CONTENT, "seoTitle" | "seoDescription" | "seoKeywords" | "seoOgImageUrl">;

export default function SeoSettingsPage() {
  const { content, isLoading, isSaving, save } = useCmsManager();
  const { canEditSeo } = usePermissions();
  const [values, setValues] = useState<SeoValues>({
    seoTitle: DEFAULT_CMS_CONTENT.seoTitle,
    seoDescription: DEFAULT_CMS_CONTENT.seoDescription,
    seoKeywords: DEFAULT_CMS_CONTENT.seoKeywords,
    seoOgImageUrl: DEFAULT_CMS_CONTENT.seoOgImageUrl,
  });

  useEffect(() => {
    if (!content) {
      return;
    }

    setValues({
      seoTitle: content.seoTitle,
      seoDescription: content.seoDescription,
      seoKeywords: content.seoKeywords,
      seoOgImageUrl: content.seoOgImageUrl,
    });
  }, [content]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="SEO Settings"
        description="Manage homepage metadata, keywords, and social preview image without changing the current site structure."
      />

      <Card>
        <CardHeader>
          <CardTitle>Homepage SEO</CardTitle>
          <CardDescription>These values sync to the public website metadata layer and social preview tags.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!content) {
                  return;
                }

                await save({
                  ...content,
                  ...values,
                });
              }}
            >
              <FormField label="Meta title" hint="Keep it concise and location-focused.">
                <Input
                  value={values.seoTitle}
                  onChange={(event) => setValues((current) => ({ ...current, seoTitle: event.target.value }))}
                  disabled={!canEditSeo}
                />
              </FormField>
              <FormField label="Meta description" hint="This appears in search snippets.">
                <Textarea
                  value={values.seoDescription}
                  onChange={(event) => setValues((current) => ({ ...current, seoDescription: event.target.value }))}
                  disabled={!canEditSeo}
                />
              </FormField>
              <FormField label="Keywords" hint="Comma-separated keywords for internal control and metadata.">
                <Textarea
                  value={values.seoKeywords}
                  onChange={(event) => setValues((current) => ({ ...current, seoKeywords: event.target.value }))}
                  disabled={!canEditSeo}
                />
              </FormField>
              <FormField label="Open Graph image URL">
                <Input
                  value={values.seoOgImageUrl}
                  onChange={(event) => setValues((current) => ({ ...current, seoOgImageUrl: event.target.value }))}
                  disabled={!canEditSeo}
                />
              </FormField>

              <div className="flex justify-end">
                <Button disabled={isSaving || !canEditSeo}>
                  {isSaving ? "Saving..." : canEditSeo ? "Save SEO settings" : "Admin access required"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
