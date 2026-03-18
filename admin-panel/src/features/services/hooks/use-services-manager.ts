"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addActivityLog, deleteDocument, listCollection, saveDocument } from "@/lib/firebase/repository";
import type { DiagnosticService } from "@/types";

export function useServicesManager() {
  const [items, setItems] = useState<DiagnosticService[]>([]);
  const [editingService, setEditingService] = useState<DiagnosticService | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<DiagnosticService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const services = await listCollection<DiagnosticService>("services");
      setItems(services);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveService = async (service: Omit<DiagnosticService, "id" | "createdAt" | "updatedAt">) => {
    setIsSaving(true);
    try {
      const saved = await saveDocument("services", {
        id: editingService?.id,
        ...service,
        createdAt: editingService?.createdAt,
      });

      await addActivityLog({
        action: editingService ? "Updated diagnostic service" : "Added diagnostic service",
        entity: "service",
        entityId: saved.id,
        actorName: "Current admin",
        actorRole: "admin",
      });

      toast.success(editingService ? "Service updated" : "Service added");
      setEditingService(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save service");
    } finally {
      setIsSaving(false);
    }
  };

  const removeService = async () => {
    if (!serviceToDelete) {
      return;
    }

    try {
      await deleteDocument("services", serviceToDelete.id);
      await addActivityLog({
        action: "Deleted diagnostic service",
        entity: "service",
        entityId: serviceToDelete.id,
        actorName: "Current admin",
        actorRole: "admin",
      });
      toast.success("Service deleted");
      setServiceToDelete(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete service");
    }
  };

  return {
    items,
    editingService,
    setEditingService,
    serviceToDelete,
    setServiceToDelete,
    isLoading,
    isSaving,
    saveService,
    removeService,
  };
}
