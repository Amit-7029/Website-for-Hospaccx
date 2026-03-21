"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { addActivityLog, deleteMediaSlot, listCollection, saveDocument, uploadImage } from "@/lib/firebase/repository";
import { DEFAULT_MEDIA_ITEMS } from "@/lib/media-defaults";
import type { MediaItem } from "@/types";

function mediaSlotKey(item: Pick<MediaItem, "section" | "order">) {
  return `${item.section}:${item.order}`;
}

function getTimestampValue(item: Pick<MediaItem, "updatedAt" | "createdAt">) {
  return new Date(item.updatedAt ?? item.createdAt ?? 0).getTime();
}

function dedupeMediaItems(items: MediaItem[]) {
  const latestBySlot = new Map<string, MediaItem>();

  items.forEach((item) => {
    const slotKey = mediaSlotKey(item);
    const current = latestBySlot.get(slotKey);
    if (!current || getTimestampValue(item) >= getTimestampValue(current)) {
      latestBySlot.set(slotKey, item);
    }
  });

  return [...latestBySlot.values()];
}

export function useMediaManager() {
  const { sessionUser } = useSession();
  const { canDeleteMedia, canUploadMedia, role } = usePermissions();
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
        dedupeMediaItems(mediaItems).sort((left, right) => {
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
    if (!canUploadMedia) {
      toast.error("You do not have permission to upload or update media");
      return;
    }

    setIsSaving(true);
    try {
      const slotMatch =
        editingItem ??
        items.find((item) => item.section === values.section && Number(item.order) === Number(values.order)) ??
        null;

      const imageUrl =
        values.imageFile instanceof File
          ? await uploadImage(values.imageFile, `media/${values.section}/${Date.now()}-${values.imageFile.name}`)
          : values.imageUrl;

      if (!imageUrl) {
        throw new Error("Please upload an image before saving this media asset.");
      }

      const saved = await saveDocument("media", {
        id: slotMatch?.id,
        title: values.title,
        caption: values.caption,
        alt: values.alt,
        imageUrl,
        section: values.section,
        category: values.category,
        ctaLabel: values.ctaLabel,
        ctaLink: values.ctaLink,
        order: values.order,
        createdAt: slotMatch?.createdAt,
      });

      await addActivityLog({
        action: slotMatch ? "Updated media asset" : "Added media asset",
        entity: "media",
        entityId: saved.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });

      toast.success(slotMatch ? "Media updated" : "Media added");
      setEditingItem(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save media");
    } finally {
      setIsSaving(false);
    }
  };

  const removeMedia = async () => {
    if (!canDeleteMedia) {
      toast.error("You do not have permission to delete media");
      return;
    }

    if (!itemToDelete) {
      return;
    }

    try {
      await deleteMediaSlot(itemToDelete.section, itemToDelete.order);
      await addActivityLog({
        action: "Deleted media asset",
        entity: "media",
        entityId: mediaSlotKey(itemToDelete),
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
    canUploadMedia,
    canDeleteMedia,
  };
}
