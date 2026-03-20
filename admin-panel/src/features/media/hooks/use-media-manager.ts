"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { addActivityLog, deleteDocument, listCollection, saveDocument, uploadImage } from "@/lib/firebase/repository";
import { DEFAULT_MEDIA_ITEMS } from "@/lib/media-defaults";
import type { MediaItem } from "@/types";

export function useMediaManager() {
  const { sessionUser } = useSession();
  const { canDelete, role } = usePermissions();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [sectionFilter, setSectionFilter] = useState<MediaItem["section"] | "all">("all");
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      let mediaItems = await listCollection<MediaItem>("media");
      if (!mediaItems.length) {
        const seededItems = await Promise.all(
          DEFAULT_MEDIA_ITEMS.map((item) =>
            saveDocument("media", {
              ...item,
            }),
          ),
        );
        mediaItems = seededItems as MediaItem[];
      }

      setItems(
        [...mediaItems].sort((left, right) => {
          if (left.section !== right.section) {
            return left.section.localeCompare(right.section);
          }

          if (left.order !== right.order) {
            return left.order - right.order;
          }

          return left.title.localeCompare(right.title);
        }),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load media");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredItems = useMemo(
    () => items.filter((item) => (sectionFilter === "all" ? true : item.section === sectionFilter)),
    [items, sectionFilter],
  );

  const saveMedia = async (
    values: Omit<MediaItem, "id" | "createdAt" | "updatedAt" | "imageUrl"> & { imageUrl?: string; imageFile?: File | null },
  ) => {
    setIsSaving(true);
    try {
      const imageUrl =
        values.imageFile instanceof File
          ? await uploadImage(values.imageFile, `media/${values.section}/${Date.now()}-${values.imageFile.name}`)
          : values.imageUrl;

      if (!imageUrl) {
        throw new Error("Please upload an image before saving this media asset.");
      }

      const saved = await saveDocument("media", {
        id: editingItem?.id,
        title: values.title,
        caption: values.caption,
        alt: values.alt,
        imageUrl,
        section: values.section,
        category: values.category,
        ctaLabel: values.ctaLabel,
        ctaLink: values.ctaLink,
        order: values.order,
        createdAt: editingItem?.createdAt,
      });

      await addActivityLog({
        action: editingItem ? "Updated media asset" : "Added media asset",
        entity: "media",
        entityId: saved.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });

      toast.success(editingItem ? "Media updated" : "Media added");
      setEditingItem(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save media");
    } finally {
      setIsSaving(false);
    }
  };

  const removeMedia = async () => {
    if (!canDelete) {
      toast.error("Only admins can delete media");
      return;
    }

    if (!itemToDelete) {
      return;
    }

    try {
      await deleteDocument("media", itemToDelete.id);
      await addActivityLog({
        action: "Deleted media asset",
        entity: "media",
        entityId: itemToDelete.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success("Media deleted");
      setItemToDelete(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete media");
    }
  };

  return {
    items: filteredItems,
    totalItems: items.length,
    sectionFilter,
    setSectionFilter,
    editingItem,
    setEditingItem,
    itemToDelete,
    setItemToDelete,
    isLoading,
    isSaving,
    saveMedia,
    removeMedia,
    canDelete,
  };
}
