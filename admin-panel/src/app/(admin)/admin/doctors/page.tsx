"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Stethoscope, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorForm } from "@/features/doctors/components/doctor-form";
import { useDoctorsManager } from "@/features/doctors/hooks/use-doctors-manager";
import { LivePreviewShell } from "@/features/preview/components/live-preview-shell";
import { useDebouncedPreview } from "@/hooks/use-debounced-preview";
import { usePermissions } from "@/hooks/use-permissions";
import { usePreviewStore } from "@/store/preview-store";
import type { Doctor } from "@/types";

function ReadOnlyAccessNotice() {
  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <h3 className="text-lg font-semibold">Read-only access</h3>
        <p className="text-sm text-muted-foreground">
          This role can view doctor information, but adding or editing doctors is disabled until the{" "}
          <span className="font-medium text-foreground">doctors_add</span> or{" "}
          <span className="font-medium text-foreground">doctors_edit</span> permission is granted.
        </p>
      </CardContent>
    </Card>
  );
}

export default function DoctorsPage() {
  const { canAddDoctors, canDeleteDoctors, canEditDoctors, canManageDoctors } = usePermissions();
  const setDoctorDraft = usePreviewStore((state) => state.setDoctorDraft);
  const setSection = usePreviewStore((state) => state.setSection);
  const {
    items,
    paginatedItems,
    departments,
    totalPages,
    page,
    setPage,
    search,
    setSearch,
    departmentFilter,
    setDepartmentFilter,
    editingDoctor,
    setEditingDoctor,
    isLoading,
    isSaving,
    doctorToDelete,
    setDoctorToDelete,
    saveDoctor,
    removeDoctor,
    bookingCountsByDoctor,
  } = useDoctorsManager();
  const [previewDoctor, setPreviewDoctor] = useState<Doctor | null>(null);

  useEffect(() => {
    setSection("doctors");
  }, [setSection]);

  useDebouncedPreview(previewDoctor, setDoctorDraft);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        description="Create, update, search, and publish specialist profiles with image upload, department filters, and availability management."
        action={
          canAddDoctors
            ? {
                label: "Add doctor",
                onClick: () => {
                  setEditingDoctor(null);
                  setPreviewDoctor(null);
                  setDoctorDraft(null);
                },
              }
            : undefined
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr,0.85fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 md:grid-cols-[1fr,220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-10"
                  placeholder="Search by doctor, department, specialization..."
                />
              </div>
              <Select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                <option value="all">All departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </Select>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-56 rounded-3xl" />
                ))}
              </div>
            ) : paginatedItems.length ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {paginatedItems.map((doctor, index) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Card className="h-full overflow-hidden">
                        <CardContent className="flex h-full flex-col gap-4 p-5">
                          <div className="flex items-start gap-4">
                            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-secondary">
                              {doctor.imageUrl ? (
                                <Image src={doctor.imageUrl} alt={doctor.name} fill className="object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-primary">
                                  <Stethoscope className="h-8 w-8" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-1">
                              <Badge>{doctor.department}</Badge>
                              <h3 className="text-lg font-semibold">{doctor.name}</h3>
                              <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                              <p className="text-sm text-muted-foreground">{doctor.qualification}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">Availability</p>
                            <ul className="space-y-1">
                              {doctor.availability.slice(0, 2).map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-auto flex gap-3">
                            {canEditDoctors ? (
                              <Button variant="outline" className="flex-1" onClick={() => setEditingDoctor(doctor)}>
                                Edit
                              </Button>
                            ) : null}
                            {canDeleteDoctors ? (
                              <Button variant="destructive" size="icon" onClick={() => setDoctorToDelete(doctor)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                      Previous
                    </Button>
                    <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={Stethoscope}
                title="No doctors found"
                description="Add your first specialist profile or adjust the current search and department filters."
              />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {canManageDoctors ? (
            <DoctorForm
              doctor={editingDoctor}
              bookingCounts={editingDoctor ? bookingCountsByDoctor[editingDoctor.id] : undefined}
              onCancel={() => {
                setEditingDoctor(null);
                setDoctorDraft(null);
              }}
              onReset={() => setDoctorDraft(null)}
              onPreviewChange={(values) => {
                if (!values.name && !values.specialization && !values.department && !values.description) {
                  setPreviewDoctor(null);
                  return;
                }

                setPreviewDoctor({
                  id: editingDoctor?.id ?? "__preview-doctor__",
                  createdAt: editingDoctor?.createdAt,
                  updatedAt: editingDoctor?.updatedAt,
                  ...values,
                });
              }}
              isSaving={isSaving}
              onSave={async (values) => {
                const saved = await saveDoctor({
                  name: values.name,
                  qualification: values.qualification,
                  specialization: values.specialization,
                  department: values.department,
                  availability: values.availability.split("\n").map((item) => item.trim()).filter(Boolean),
                  description: values.description,
                  services: values.services.split("\n").map((item) => item.trim()).filter(Boolean),
                  imageFile: values.imageFile,
                  imageUrl: values.imageUrl,
                  bookingSettings:
                    values.bookingEnabled === "enabled"
                      ? {
                          enabled: true,
                          bookingOpen: values.bookingOpen === "open",
                          otpRequired: values.otpRequired === "required",
                          dates: [
                            {
                              date: values.bookingDateOne,
                              limit: Number(values.bookingLimitOne || 0),
                            },
                            {
                              date: values.bookingDateTwo,
                              limit: Number(values.bookingLimitTwo || 0),
                            },
                            {
                              date: values.bookingDateThree,
                              limit: Number(values.bookingLimitThree || 0),
                            },
                          ].filter((entry): entry is { date: string; limit: number } => Boolean(entry.date && entry.limit > 0)),
                        }
                      : {
                          enabled: false,
                          bookingOpen: false,
                          otpRequired: false,
                          dates: [],
                        },
                });

                if (saved) {
                  setPreviewDoctor(null);
                  setDoctorDraft(null);
                }
              }}
            />
          ) : (
            <ReadOnlyAccessNotice />
          )}

          <LivePreviewShell
            title="Doctor section preview"
            description="Review how this doctor card fits into the published doctor section before saving."
            allowedSections={["doctors", "homepage"]}
            seed={{
              doctors: items,
            }}
            onReset={() => {
              setDoctorDraft(null);
              setPreviewDoctor(null);
            }}
          />
        </div>
      </div>

      {canDeleteDoctors ? (
        <ConfirmDialog
          open={Boolean(doctorToDelete)}
          title="Delete doctor profile?"
          description="This will permanently remove the doctor from the admin system and website data source."
          destructive
          confirmLabel="Delete doctor"
          onClose={() => setDoctorToDelete(null)}
          onConfirm={() => void removeDoctor()}
        />
      ) : null}
    </div>
  );
}
