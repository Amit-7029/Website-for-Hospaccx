"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceForm } from "@/features/services/components/service-form";
import { useServicesManager } from "@/features/services/hooks/use-services-manager";
import { LivePreviewShell } from "@/features/preview/components/live-preview-shell";
import { useDebouncedPreview } from "@/hooks/use-debounced-preview";
import { usePermissions } from "@/hooks/use-permissions";
import { usePreviewStore } from "@/store/preview-store";
import type { DiagnosticService } from "@/types";

export default function ServicesPage() {
  const { canAddServices, canDeleteServices, canEditServices, canManageServices } = usePermissions();
  const setServiceDraft = usePreviewStore((state) => state.setServiceDraft);
  const setSection = usePreviewStore((state) => state.setSection);
  const {
    items,
    editingService,
    setEditingService,
    serviceToDelete,
    setServiceToDelete,
    isLoading,
    isSaving,
    saveService,
    removeService,
  } = useServicesManager();
  const [previewService, setPreviewService] = useState<DiagnosticService | null>(null);

  useEffect(() => {
    setSection("services");
  }, [setSection]);

  useDebouncedPreview(previewService, setServiceDraft);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diagnostic Services"
        description="Maintain clean, category-based service content used across the diagnostic and laboratory sections."
        action={
          canAddServices
            ? {
                label: "Add service",
                onClick: () => {
                  setEditingService(null);
                  setPreviewService(null);
                  setServiceDraft(null);
                },
              }
            : undefined
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1.25fr,0.85fr]">
        <Card>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-48 rounded-3xl" />)
            ) : items.length ? (
              items.map((service) => (
                <Card key={service.id} className="border bg-background/50 shadow-none">
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <Badge>{service.category}</Badge>
                      <h3 className="mt-3 text-lg font-semibold">{service.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <div className="flex gap-3">
                      {canEditServices ? (
                        <Button variant="outline" className="flex-1" onClick={() => setEditingService(service)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      ) : null}
                      {canDeleteServices ? (
                        <Button variant="destructive" size="icon" onClick={() => setServiceToDelete(service)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="md:col-span-2">
                <EmptyState
                  icon={ClipboardList}
                  title="No services added yet"
                  description="Start with your core laboratory categories and keep each description clear and patient-friendly."
                />
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-6">
          {canManageServices ? (
            <ServiceForm
              service={editingService}
              onCancel={() => {
                setEditingService(null);
                setServiceDraft(null);
              }}
              onReset={() => setServiceDraft(null)}
              onPreviewChange={(values) => {
                if (!values.title && !values.description && !values.category) {
                  setPreviewService(null);
                  return;
                }

                setPreviewService({
                  id: editingService?.id ?? "__preview-service__",
                  createdAt: editingService?.createdAt,
                  updatedAt: editingService?.updatedAt,
                  ...values,
                });
              }}
              isSaving={isSaving}
              onSave={async (values) => {
                const saved = await saveService(values);
                if (saved) {
                  setPreviewService(null);
                  setServiceDraft(null);
                }
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                This role can view service records, but creating or editing services requires{" "}
                <span className="font-medium text-foreground">services_add</span> or{" "}
                <span className="font-medium text-foreground">services_edit</span>.
              </CardContent>
            </Card>
          )}

          <LivePreviewShell
            title="Services preview"
            description="See how service cards will appear on the homepage and services experience before saving."
            allowedSections={["services", "homepage"]}
            seed={{
              services: items,
            }}
            onReset={() => {
              setServiceDraft(null);
              setPreviewService(null);
            }}
          />
        </div>
      </div>

      {canDeleteServices ? (
        <ConfirmDialog
          open={Boolean(serviceToDelete)}
          title="Delete service?"
          description="This removes the service from the dashboard and published service catalog."
          destructive
          confirmLabel="Delete service"
          onClose={() => setServiceToDelete(null)}
          onConfirm={() => void removeService()}
        />
      ) : null}
    </div>
  );
}
