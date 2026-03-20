"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { addActivityLog, deleteDocument, listCollection, saveDocument, uploadImage } from "@/lib/firebase/repository";
import type { Doctor } from "@/types";

const PAGE_SIZE = 6;

export function useDoctorsManager() {
  const { sessionUser } = useSession();
  const { canDelete, role } = usePermissions();
  const [items, setItems] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const doctors = await listCollection<Doctor>("doctors");
      setItems(doctors);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load doctors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const departments = useMemo(
    () =>
      Array.from(new Set(items.map((doctor) => doctor.department).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [items],
  );

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase();
    return items.filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialization.toLowerCase().includes(query) ||
        doctor.department.toLowerCase().includes(query);
      const matchesDepartment = departmentFilter === "all" || doctor.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [departmentFilter, items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const paginatedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, departmentFilter]);

  const saveDoctor = async (
    doctor: Omit<Doctor, "id" | "createdAt" | "updatedAt" | "imageUrl"> & { imageUrl?: string; imageFile?: File | null },
  ) => {
    setIsSaving(true);
    try {
      const imageUrl =
        doctor.imageFile instanceof File
          ? await uploadImage(doctor.imageFile, `doctors/${Date.now()}-${doctor.imageFile.name}`)
          : doctor.imageUrl;

      const saved = await saveDocument("doctors", {
        id: editingDoctor?.id,
        name: doctor.name,
        specialization: doctor.specialization,
        department: doctor.department,
        qualification: doctor.qualification,
        availability: doctor.availability,
        description: doctor.description,
        services: doctor.services,
        imageUrl,
        createdAt: editingDoctor?.createdAt,
      });

      await addActivityLog({
        action: editingDoctor ? "Updated doctor profile" : "Added doctor profile",
        entity: "doctor",
        entityId: saved.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });

      toast.success(editingDoctor ? "Doctor updated" : "Doctor added");
      setEditingDoctor(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save doctor");
    } finally {
      setIsSaving(false);
    }
  };

  const removeDoctor = async () => {
    if (!canDelete) {
      toast.error("Only admins can delete doctor profiles");
      return;
    }

    if (!doctorToDelete) {
      return;
    }

    try {
      await deleteDocument("doctors", doctorToDelete.id);
      await addActivityLog({
        action: "Deleted doctor profile",
        entity: "doctor",
        entityId: doctorToDelete.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success("Doctor deleted");
      setDoctorToDelete(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete doctor");
    }
  };

  return {
    items,
    departments,
    paginatedItems,
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
    canDelete,
  };
}
