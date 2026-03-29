"use client";

import { unparse } from "papaparse";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { addActivityLog, deleteDocument, listCollection, saveDocument } from "@/lib/firebase/repository";
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

  const removeAppointment = async (appointment: Appointment) => {
    if (!canDeleteAppointments) {
      toast.error("You do not have permission to delete appointments");
      return;
    }

    try {
      await deleteDocument("appointments", appointment.id);
      await addActivityLog({
        action: "Deleted appointment",
        entity: "appointment",
        entityId: appointment.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success("Appointment deleted");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete appointment");
    }
  };

  const getDobValue = (appointment: Appointment) => {
    if (appointment.dateOfBirth) {
      return appointment.dateOfBirth;
    }

    const message = String(appointment.message ?? "");
    const dobMatch = message.match(/Date of Birth:\s*([^|]+)/i);
    return dobMatch?.[1]?.trim() ?? "";
  };

  const getSlotOrTimeValue = (appointment: Appointment) => {
    const selectedTime = String(appointment.selectedTime ?? "").trim();
    if (selectedTime) {
      return selectedTime;
    }

    const message = String(appointment.message ?? "");
    const timeMatch = message.match(/Preferred Time:\s*([^|]+)/i);
    return timeMatch?.[1]?.trim() ?? "";
  };

  const getBookedDateValue = (appointment: Appointment) => {
    if (appointment.selectedDate) {
      return appointment.selectedDate;
    }

    const message = String(appointment.message ?? "");
    const dateMatch = message.match(/Preferred Date:\s*([^|]+)/i);
    return dateMatch?.[1]?.trim() ?? appointment.date ?? "";
  };

  const exportCsv = () => {
    const csv = unparse(
      filteredItems.map((item) => ({
        Name: item.name,
        "Phone Number": item.phone,
        DOB: getDobValue(item),
        "Appointment Date": getBookedDateValue(item),
        "Slot Number / Time": getSlotOrTimeValue(item),
        Status: item.status,
        Department: item.department ?? "",
        Doctor: item.doctor ?? "",
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
    removeAppointment,
    exportCsv,
    canUpdateAppointments,
    canDeleteAppointments,
  };
}
