"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { listCollection, saveDocument } from "@/lib/firebase/repository";
import type { NotificationItem } from "@/types";

const POLL_INTERVAL = 20000;

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const notifications = await listCollection<NotificationItem>("notifications");
      setItems(notifications.slice(0, 20));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, POLL_INTERVAL);
    return () => window.clearInterval(intervalId);
  }, [load]);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const markAsRead = useCallback(
    async (item: NotificationItem) => {
      if (item.read) {
        return;
      }

      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
      try {
        await saveDocument("notifications", {
          ...item,
          read: true,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to update notification");
        await load();
      }
    },
    [load],
  );

  const markAllAsRead = useCallback(async () => {
    const unreadItems = items.filter((item) => !item.read);
    if (!unreadItems.length) {
      return;
    }

    setItems((current) => current.map((item) => ({ ...item, read: true })));
    try {
      await Promise.all(
        unreadItems.map((item) =>
          saveDocument("notifications", {
            ...item,
            read: true,
          }),
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to mark notifications as read");
      await load();
    }
  }, [items, load]);

  return {
    items,
    isLoading,
    unreadCount,
    isOpen,
    setIsOpen,
    toggleOpen: () => setIsOpen((current) => !current),
    markAsRead,
    markAllAsRead,
    reload: load,
  };
}
