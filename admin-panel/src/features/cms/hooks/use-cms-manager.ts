"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addActivityLog, loadCmsContent, saveCmsContent } from "@/lib/firebase/repository";
import type { CmsContent } from "@/types";

export function useCmsManager() {
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
    setIsSaving(true);
    try {
      await saveCmsContent(values);
      await addActivityLog({
        action: "Updated website CMS content",
        entity: "cms",
        entityId: "website",
        actorName: "Current admin",
        actorRole: "admin",
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
  };
}
