"use client";

import { unparse } from "papaparse";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { addActivityLog, listCollection, saveDocument } from "@/lib/firebase/repository";
import type { Appointment } from "@/types";

export function useAppointmentsManager() {
  const { sessionUser } = useSession();
  const { canDeleteAppointments, canUpdateAppointments, role } = usePermissions();
  const [items, setItems] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<Appointment["status"] | "all">("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const appointments = await listCollection<Appointment>("appointments");
      setItems(appointments);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase();
    return items.filter((appointment) => {
      const matchesStatus = filter === "all" || appointment.status === filter;
      const matchesSearch =
        appointment.name.toLowerCase().includes(query) ||
        appointment.phone.toLowerCase().includes(query) ||
        appointment.doctor?.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [filter, items, search]);

  const updateStatus = async (appointment: Appointment, status: Appointment["status"]) => {
    if (!canUpdateAppointments) {
      toast.error("You do not have permission to update appointments");
      return;
    }

    try {
      await saveDocument("appointments", {
        ...appointment,
        status,
      });
      await addActivityLog({
        action: `Updated appointment to ${status}`,
        entity: "appointment",
        entityId: appointment.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success(`Appointment marked as ${status}`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update appointment");
    }
  };

  const exportCsv = () => {
    const csv = unparse(
      filteredItems.map((item) => ({
        Name: item.name,
        Phone: item.phone,
        Date: item.date,
        Doctor: item.doctor ?? "",
        Status: item.status,
        Message: item.message ?? "",
      })),
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "appointments.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return {
    items: filteredItems,
    filter,
    setFilter,
    search,
    setSearch,
    isLoading,
    updateStatus,
    exportCsv,
    canUpdateAppointments,
    canDeleteAppointments,
  };
}
