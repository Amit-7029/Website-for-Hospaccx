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
  whyChooseHeading: z.string().min(5),
  missionHeading: z.string().min(5),
  missionDescription: z.string().min(10),
  visionHeading: z.string().min(5),
  visionDescription: z.string().min(10),
  healthcareHeading: z.string().min(5),
  servicesHeading: z.string().min(5),
  servicesNote: z.string().min(10),
  reviewsHeading: z.string().min(5),
  reviewsSubtitle: z.string().min(5),
  appointmentHeading: z.string().min(5),
  appointmentDescription: z.string().min(10),
  contactHeading: z.string().min(5),
  contactDescription: z.string().min(10),
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
        description="Manage homepage section copy, emergency text, and contact information without editing source code."
      />
      <Card>
        <CardHeader>
          <CardTitle>Website content management</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 14 }).map((_, index) => (
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
              <FormField label="Why Choose Us heading" error={form.formState.errors.whyChooseHeading?.message}>
                <Input {...form.register("whyChooseHeading")} />
              </FormField>
              <FormField label="Healthcare heading" error={form.formState.errors.healthcareHeading?.message}>
                <Input {...form.register("healthcareHeading")} />
              </FormField>
              <FormField label="Mission heading" error={form.formState.errors.missionHeading?.message}>
                <Input {...form.register("missionHeading")} />
              </FormField>
              <FormField label="Vision heading" error={form.formState.errors.visionHeading?.message}>
                <Input {...form.register("visionHeading")} />
              </FormField>
              <FormField className="md:col-span-2" label="Mission description" error={form.formState.errors.missionDescription?.message}>
                <Textarea {...form.register("missionDescription")} />
              </FormField>
              <FormField className="md:col-span-2" label="Vision description" error={form.formState.errors.visionDescription?.message}>
                <Textarea {...form.register("visionDescription")} />
              </FormField>
              <FormField label="Services heading" error={form.formState.errors.servicesHeading?.message}>
                <Input {...form.register("servicesHeading")} />
              </FormField>
              <FormField label="Reviews heading" error={form.formState.errors.reviewsHeading?.message}>
                <Input {...form.register("reviewsHeading")} />
              </FormField>
              <FormField className="md:col-span-2" label="Services note" error={form.formState.errors.servicesNote?.message}>
                <Textarea {...form.register("servicesNote")} />
              </FormField>
              <FormField className="md:col-span-2" label="Reviews subtitle" error={form.formState.errors.reviewsSubtitle?.message}>
                <Textarea {...form.register("reviewsSubtitle")} />
              </FormField>
              <FormField label="Appointment heading" error={form.formState.errors.appointmentHeading?.message}>
                <Input {...form.register("appointmentHeading")} />
              </FormField>
              <FormField label="Contact heading" error={form.formState.errors.contactHeading?.message}>
                <Input {...form.register("contactHeading")} />
              </FormField>
              <FormField className="md:col-span-2" label="Appointment description" error={form.formState.errors.appointmentDescription?.message}>
                <Textarea {...form.register("appointmentDescription")} />
              </FormField>
              <FormField className="md:col-span-2" label="Contact description" error={form.formState.errors.contactDescription?.message}>
                <Textarea {...form.register("contactDescription")} />
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
