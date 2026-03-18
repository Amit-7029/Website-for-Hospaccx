"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useCmsManager } from "@/features/cms/hooks/use-cms-manager";

const schema = z.object({
  heroHeading: z.string().min(5),
  heroDescription: z.string().min(10),
  aboutHeading: z.string().min(5),
  aboutDescription: z.string().min(10),
  contactPhone: z.string().min(5),
  contactEmail: z.string().email(),
  contactAddress: z.string().min(10),
  emergencyText: z.string().min(10),
});

type Values = z.infer<typeof schema>;

export default function SettingsPage() {
  const { content, isLoading, isSaving, save } = useCmsManager();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (content) {
      form.reset(content);
    }
  }, [content, form]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & CMS"
        description="Manage homepage messaging, emergency text, and contact information without editing source code."
      />
      <Card>
        <CardHeader>
          <CardTitle>Website content management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-3xl" />
              ))}
            </div>
          ) : (
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(async (values) => save(values))}>
              <FormField label="Hero heading" error={form.formState.errors.heroHeading?.message}>
                <Input {...form.register("heroHeading")} />
              </FormField>
              <FormField label="About heading" error={form.formState.errors.aboutHeading?.message}>
                <Input {...form.register("aboutHeading")} />
              </FormField>
              <FormField className="md:col-span-2" label="Hero description" error={form.formState.errors.heroDescription?.message}>
                <Textarea {...form.register("heroDescription")} />
              </FormField>
              <FormField className="md:col-span-2" label="About description" error={form.formState.errors.aboutDescription?.message}>
                <Textarea {...form.register("aboutDescription")} />
              </FormField>
              <FormField label="Contact phone" error={form.formState.errors.contactPhone?.message}>
                <Input {...form.register("contactPhone")} />
              </FormField>
              <FormField label="Contact email" error={form.formState.errors.contactEmail?.message}>
                <Input {...form.register("contactEmail")} />
              </FormField>
              <FormField className="md:col-span-2" label="Contact address" error={form.formState.errors.contactAddress?.message}>
                <Textarea {...form.register("contactAddress")} />
              </FormField>
              <FormField className="md:col-span-2" label="Emergency text" error={form.formState.errors.emergencyText?.message}>
                <Textarea {...form.register("emergencyText")} />
              </FormField>
              <div className="md:col-span-2 flex justify-end">
                <Button disabled={isSaving}>{isSaving ? "Saving..." : "Save website content"}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
