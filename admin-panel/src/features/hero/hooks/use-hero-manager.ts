"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { DEFAULT_HERO_CONTENT } from "@/lib/constants";
import { addActivityLog, loadHeroContent, saveHeroContent } from "@/lib/firebase/repository";
import type { HeroContent } from "@/types";

export function useHeroManager() {
  const { sessionUser } = useSession();
  const { canManageCms, role } = usePermissions();
  const [content, setContent] = useState<HeroContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function run() {
      setIsLoading(true);
      try {
        setContent(await loadHeroContent());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load hero content");
        setContent(DEFAULT_HERO_CONTENT);
      } finally {
        setIsLoading(false);
      }
    }

    void run();
  }, []);

  const save = async (values: HeroContent) => {
    if (!canManageCms) {
      toast.error("Only admins can update hero content");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await saveHeroContent(values);
      await addActivityLog({
        action: "Updated hero section",
        entity: "content",
        entityId: "hero",
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      setContent(saved);
      toast.success("Hero section updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save hero content");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    content,
    isLoading,
    isSaving,
    save,
    canManageCms,
  };
}
