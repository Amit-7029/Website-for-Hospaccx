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

function formatIsoDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getDefaultBookingDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [1, 2, 3].map((offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return formatIsoDate(date);
  });
}

function getInitialBookingSettings(doctor: Doctor | null) {
  const fallbackDates = getDefaultBookingDates();
  const doctorName = doctor?.name?.toLowerCase().replace(/\s+/g, " ").trim() ?? "";
  const shouldPrefillBiswajit = doctorName.includes("biswajit majumdar");
  const dates = doctor?.bookingSettings?.dates?.slice(0, 3) ?? [];
  const defaultTimeSlots = "09:00 AM, 09:30 AM, 10:00 AM, 10:30 AM, 11:00 AM, 11:30 AM, 12:00 PM";
  const readSlots = (entry?: { timeSlots?: string[] }) => {
    if (shouldPrefillBiswajit) {
      return "";
    }

    return Array.isArray(entry?.timeSlots) && entry.timeSlots?.length ? entry.timeSlots.join(", ") : defaultTimeSlots;
  };

  return {
    bookingEnabled: doctor?.bookingSettings?.enabled ?? shouldPrefillBiswajit,
    bookingOpen: doctor?.bookingSettings?.bookingOpen ?? true,
    otpRequired: doctor?.bookingSettings?.otpRequired ?? false,
    bookingDateOne: dates[0]?.date ?? (shouldPrefillBiswajit ? fallbackDates[0] : ""),
    bookingLimitOne: String(dates[0]?.limit ?? (shouldPrefillBiswajit ? 80 : 0)),
    bookingSlotsOne: readSlots(dates[0]),
    bookingDateTwo: dates[1]?.date ?? (shouldPrefillBiswajit ? fallbackDates[1] : ""),
    bookingLimitTwo: String(dates[1]?.limit ?? (shouldPrefillBiswajit ? 120 : 0)),
    bookingSlotsTwo: readSlots(dates[1]),
    bookingDateThree: dates[2]?.date ?? (shouldPrefillBiswajit ? fallbackDates[2] : ""),
    bookingLimitThree: String(dates[2]?.limit ?? (shouldPrefillBiswajit ? 100 : 0)),
    bookingSlotsThree: readSlots(dates[2]),
  };
}

const schema = z.object({
  name: z.string().min(2),
  qualification: z.string().min(2),
  specialization: z.string().min(2),
  department: z.string().min(2),
  availability: z.string().min(2),
  description: z.string().min(10),
  services: z.string().min(5),
  bookingEnabled: z.enum(["enabled", "disabled"]),
  bookingOpen: z.enum(["open", "closed"]),
  otpRequired: z.enum(["required", "optional"]),
  bookingDateOne: z.string().optional(),
  bookingLimitOne: z.string().optional(),
  bookingSlotsOne: z.string().optional(),
  bookingDateTwo: z.string().optional(),
  bookingLimitTwo: z.string().optional(),
  bookingSlotsTwo: z.string().optional(),
  bookingDateThree: z.string().optional(),
  bookingLimitThree: z.string().optional(),
  bookingSlotsThree: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function DoctorForm({
  doctor,
  onCancel,
  onSave,
  onPreviewChange,
  onReset,
  isSaving,
  bookingCounts,
}: {
  doctor: Doctor | null;
  onCancel: () => void;
  onSave: (values: Values & { imageFile?: File | null; imageUrl?: string }) => Promise<void>;
  onPreviewChange?: (values: {
    name: string;
    qualification: string;
    specialization: string;
    department: string;
    availability: string[];
    description: string;
    services: string[];
    imageUrl?: string;
    bookingSettings?: Doctor["bookingSettings"];
  }) => void;
  onReset?: () => void;
  isSaving: boolean;
  bookingCounts?: Record<string, number>;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>(doctor?.imageUrl);
  const isBiswajitControlledDoctor = doctor?.name?.toLowerCase().replace(/\s+/g, " ").includes("biswajit majumdar");
  const initialBookingSettings = getInitialBookingSettings(doctor);
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
      bookingEnabled: initialBookingSettings.bookingEnabled ? "enabled" : "disabled",
      bookingOpen: initialBookingSettings.bookingOpen ? "open" : "closed",
      otpRequired: initialBookingSettings.otpRequired ? "required" : "optional",
      bookingDateOne: initialBookingSettings.bookingDateOne,
      bookingLimitOne: initialBookingSettings.bookingLimitOne,
      bookingSlotsOne: initialBookingSettings.bookingSlotsOne,
      bookingDateTwo: initialBookingSettings.bookingDateTwo,
      bookingLimitTwo: initialBookingSettings.bookingLimitTwo,
      bookingSlotsTwo: initialBookingSettings.bookingSlotsTwo,
      bookingDateThree: initialBookingSettings.bookingDateThree,
      bookingLimitThree: initialBookingSettings.bookingLimitThree,
      bookingSlotsThree: initialBookingSettings.bookingSlotsThree,
    },
  });

  useEffect(() => {
    const bookingSettings = getInitialBookingSettings(doctor);
    form.reset({
      name: doctor?.name ?? "",
      qualification: doctor?.qualification ?? "",
      specialization: doctor?.specialization ?? "",
      department: doctor?.department ?? "",
      availability: doctor?.availability.join("\n") ?? "",
      description: doctor?.description ?? "",
      services: doctor?.services.join("\n") ?? "",
      bookingEnabled: bookingSettings.bookingEnabled ? "enabled" : "disabled",
      bookingOpen: bookingSettings.bookingOpen ? "open" : "closed",
      otpRequired: bookingSettings.otpRequired ? "required" : "optional",
      bookingDateOne: bookingSettings.bookingDateOne,
      bookingLimitOne: bookingSettings.bookingLimitOne,
      bookingSlotsOne: bookingSettings.bookingSlotsOne,
      bookingDateTwo: bookingSettings.bookingDateTwo,
      bookingLimitTwo: bookingSettings.bookingLimitTwo,
      bookingSlotsTwo: bookingSettings.bookingSlotsTwo,
      bookingDateThree: bookingSettings.bookingDateThree,
      bookingLimitThree: bookingSettings.bookingLimitThree,
      bookingSlotsThree: bookingSettings.bookingSlotsThree,
    });
    setImageFile(null);
    setPreviewImageUrl(doctor?.imageUrl);
  }, [doctor, form]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewImageUrl(doctor?.imageUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewImageUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [doctor?.imageUrl, imageFile]);

  useEffect(() => {
    const buildPreviewBookingSettings = (values: Values) => {
      if (values.bookingEnabled !== "enabled") {
        return {
          enabled: false,
          bookingOpen: values.bookingOpen === "open",
          otpRequired: values.otpRequired === "required",
          dates: [],
        };
      }

      const datePairs = [
        { date: values.bookingDateOne, limit: values.bookingLimitOne, slots: values.bookingSlotsOne },
        { date: values.bookingDateTwo, limit: values.bookingLimitTwo, slots: values.bookingSlotsTwo },
        { date: values.bookingDateThree, limit: values.bookingLimitThree, slots: values.bookingSlotsThree },
      ];

      return {
        enabled: true,
        bookingOpen: values.bookingOpen === "open",
        otpRequired: values.otpRequired === "required",
        dates: datePairs
          .map((entry) => ({
            date: String(entry.date ?? "").trim(),
            limit: Number(entry.limit ?? 0),
            timeSlots: String(entry.slots ?? "")
              .split(/[\n,]/)
              .map((slot) => slot.trim())
              .filter(Boolean),
          }))
          .filter((entry) => entry.date && entry.limit > 0),
      };
    };

    const pushPreview = (values: Values) => {
      onPreviewChange?.({
        name: values.name?.trim() ?? "",
        qualification: values.qualification?.trim() ?? "",
        specialization: values.specialization?.trim() ?? "",
        department: values.department?.trim() ?? "",
        availability: values.availability
          ?.split("\n")
          .map((item) => item.trim())
          .filter(Boolean) ?? [],
        description: values.description?.trim() ?? "",
        services: values.services
          ?.split("\n")
          .map((item) => item.trim())
          .filter(Boolean) ?? [],
        imageUrl: previewImageUrl,
        bookingSettings: buildPreviewBookingSettings(values),
      });
    };

    pushPreview(form.getValues());
    const subscription = form.watch((value) => {
      pushPreview(value as Values);
    });

    return () => subscription.unsubscribe();
  }, [form, onPreviewChange, previewImageUrl]);

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

          <Card className="border-dashed bg-muted/30">
            <CardContent className="grid gap-4 p-5">
              <div>
                <h3 className="text-base font-semibold">Controlled booking settings</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use this only when a doctor needs limited booking dates, per-day caps, and OTP verification.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Booking control">
                  <select className="h-11 rounded-2xl border border-input bg-background px-3 text-sm" {...form.register("bookingEnabled")}>
                    <option value="disabled">Disabled</option>
                    <option value="enabled">Enabled</option>
                  </select>
                </FormField>
                <FormField label="Booking status">
                  <select className="h-11 rounded-2xl border border-input bg-background px-3 text-sm" {...form.register("bookingOpen")}>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </FormField>
                <FormField label="OTP verification">
                  <select className="h-11 rounded-2xl border border-input bg-background px-3 text-sm" {...form.register("otpRequired")}>
                    <option value="required">Required</option>
                    <option value="optional">Optional</option>
                  </select>
                </FormField>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    key: "One",
                    dateField: "bookingDateOne",
                    limitField: "bookingLimitOne",
                    slotsField: "bookingSlotsOne",
                  },
                  {
                    key: "Two",
                    dateField: "bookingDateTwo",
                    limitField: "bookingLimitTwo",
                    slotsField: "bookingSlotsTwo",
                  },
                  {
                    key: "Three",
                    dateField: "bookingDateThree",
                    limitField: "bookingLimitThree",
                    slotsField: "bookingSlotsThree",
                  },
                ].map((item, index) => {
                  const dateValue = form.watch(item.dateField as keyof Values);
                  const bookedCount = dateValue ? bookingCounts?.[String(dateValue)] ?? 0 : 0;

                  return (
                    <div key={item.key} className="rounded-3xl border border-border/70 bg-background p-4">
                      <p className="text-sm font-semibold text-foreground">Booking day {index + 1}</p>
                      <div className="mt-3 grid gap-3">
                        <FormField label="Date">
                          <Input type="date" {...form.register(item.dateField as keyof Values)} />
                        </FormField>
                        <FormField label="Limit">
                          <Input type="number" min="0" placeholder="0" {...form.register(item.limitField as keyof Values)} />
                        </FormField>
                        <FormField
                          label="Time slots"
                          hint={
                            isBiswajitControlledDoctor
                              ? "For Dr. Biswajit, leave this empty. Slot 1 to the daily limit will be generated automatically."
                              : "Comma separated. Example: 09:00 AM, 09:30 AM, 10:00 AM"
                          }
                        >
                          <Textarea
                            rows={3}
                            {...form.register(item.slotsField as keyof Values)}
                            placeholder={isBiswajitControlledDoctor ? "Auto-generated: Slot 1, Slot 2, Slot 3..." : "09:00 AM, 09:30 AM, 10:00 AM"}
                          />
                        </FormField>
                        <div className="rounded-2xl bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
                          Booked count: <span className="font-semibold text-foreground">{bookedCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset({
                  name: doctor?.name ?? "",
                  qualification: doctor?.qualification ?? "",
                  specialization: doctor?.specialization ?? "",
                  department: doctor?.department ?? "",
                  availability: doctor?.availability.join("\n") ?? "",
                  description: doctor?.description ?? "",
                  services: doctor?.services.join("\n") ?? "",
                  bookingEnabled: initialBookingSettings.bookingEnabled ? "enabled" : "disabled",
                  bookingOpen: initialBookingSettings.bookingOpen ? "open" : "closed",
                  otpRequired: initialBookingSettings.otpRequired ? "required" : "optional",
                  bookingDateOne: initialBookingSettings.bookingDateOne,
                  bookingLimitOne: initialBookingSettings.bookingLimitOne,
                  bookingSlotsOne: initialBookingSettings.bookingSlotsOne,
                  bookingDateTwo: initialBookingSettings.bookingDateTwo,
                  bookingLimitTwo: initialBookingSettings.bookingLimitTwo,
                  bookingSlotsTwo: initialBookingSettings.bookingSlotsTwo,
                  bookingDateThree: initialBookingSettings.bookingDateThree,
                  bookingLimitThree: initialBookingSettings.bookingLimitThree,
                  bookingSlotsThree: initialBookingSettings.bookingSlotsThree,
                });
                setImageFile(null);
                setPreviewImageUrl(doctor?.imageUrl);
                onReset?.();
              }}
            >
              Reset
            </Button>
            <Button disabled={isSaving}>{isSaving ? "Saving..." : doctor ? "Save changes" : "Add doctor"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
