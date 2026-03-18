"use client";

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

export default function ServicesPage() {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diagnostic Services"
        description="Maintain clean, category-based service content used across the diagnostic and laboratory sections."
        action={{ label: "Add service", onClick: () => setEditingService(null) }}
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
                      <Button variant="outline" className="flex-1" onClick={() => setEditingService(service)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => setServiceToDelete(service)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        <ServiceForm service={editingService} onCancel={() => setEditingService(null)} isSaving={isSaving} onSave={saveService} />
      </div>

      <ConfirmDialog
        open={Boolean(serviceToDelete)}
        title="Delete service?"
        description="This removes the service from the dashboard and published service catalog."
        destructive
        confirmLabel="Delete service"
        onClose={() => setServiceToDelete(null)}
        onConfirm={() => void removeService()}
      />
    </div>
  );
}
