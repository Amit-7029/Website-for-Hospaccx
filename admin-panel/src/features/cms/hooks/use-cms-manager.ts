"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { addActivityLog, loadCmsContent, saveCmsContent } from "@/lib/firebase/repository";
import type { CmsContent } from "@/types";

export function useCmsManager() {
  const { sessionUser } = useSession();
  const { canEditSettings, role } = usePermissions();
  const [content, setContent] = useState<CmsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function run() {
      setIsLoading(true);
      try {
        setContent(await loadCmsContent());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load CMS content");
      } finally {
        setIsLoading(false);
      }
    }

    void run();
  }, []);

  const save = async (values: CmsContent) => {
    if (!canEditSettings) {
      toast.error("Only admins can update website content");
      return;
    }

    setIsSaving(true);
    try {
      await saveCmsContent(values);
      await addActivityLog({
        action: "Updated website CMS content",
        entity: "cms",
        entityId: "website",
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      setContent(values);
      toast.success("Website content updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save CMS content");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    content,
    isLoading,
    isSaving,
    save,
    canManageCms: canEditSettings,
  };
}
