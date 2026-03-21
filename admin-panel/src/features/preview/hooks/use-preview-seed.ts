"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_CMS_CONTENT, DEFAULT_HERO_CONTENT, DEFAULT_SERVICES } from "@/lib/constants";
import { listCollection, loadCmsContent, loadHeroContent } from "@/lib/firebase/repository";
import { usePreviewStore } from "@/store/preview-store";
import type { DiagnosticService, Doctor, Review } from "@/types";
import type { WebsitePreviewSnapshot } from "@/features/preview/types";

interface PreviewSeedOverrides {
  hero?: WebsitePreviewSnapshot["hero"] | null;
  cms?: WebsitePreviewSnapshot["cms"] | null;
  doctors?: WebsitePreviewSnapshot["doctors"] | null;
  services?: WebsitePreviewSnapshot["services"] | null;
  reviews?: WebsitePreviewSnapshot["reviews"] | null;
}

const DEFAULT_SNAPSHOT: WebsitePreviewSnapshot = {
  hero: DEFAULT_HERO_CONTENT,
  cms: DEFAULT_CMS_CONTENT,
  doctors: [],
  services: DEFAULT_SERVICES,
  reviews: [],
};

function mergeDefinedCmsDraft(base: WebsitePreviewSnapshot["cms"], draft: Partial<WebsitePreviewSnapshot["cms"]> | null) {
  if (!draft) {
    return base;
  }

  const definedEntries = Object.fromEntries(
    Object.entries(draft).filter(([, value]) => typeof value === "string"),
  ) as Partial<WebsitePreviewSnapshot["cms"]>;

  return {
    ...base,
    ...definedEntries,
  } as WebsitePreviewSnapshot["cms"];
}

function mergeDoctorDraft(items: Doctor[], draft: Doctor | null) {
  if (!draft) {
    return items;
  }

  const existingIndex = items.findIndex((item) => item.id === draft.id);
  if (existingIndex >= 0) {
    const nextItems = [...items];
    nextItems[existingIndex] = {
      ...nextItems[existingIndex],
      ...draft,
    };
    return nextItems;
  }

  return [draft, ...items];
}

function mergeServiceDraft(items: DiagnosticService[], draft: DiagnosticService | null) {
  if (!draft) {
    return items;
  }

  const existingIndex = items.findIndex((item) => item.id === draft.id);
  if (existingIndex >= 0) {
    const nextItems = [...items];
    nextItems[existingIndex] = {
      ...nextItems[existingIndex],
      ...draft,
    };
    return nextItems;
  }

  return [draft, ...items];
}

export function usePreviewSeed(overrides: PreviewSeedOverrides = {}) {
  const draftMode = usePreviewStore((state) => state.draftMode);
  const heroDraft = usePreviewStore((state) => state.heroDraft);
  const cmsDraft = usePreviewStore((state) => state.cmsDraft);
  const doctorDraft = usePreviewStore((state) => state.doctorDraft);
  const serviceDraft = usePreviewStore((state) => state.serviceDraft);
  const reviewsDraft = usePreviewStore((state) => state.reviewsDraft);
  const [loaded, setLoaded] = useState<PreviewSeedOverrides>({});
  const [isLoading, setIsLoading] = useState(true);
  const hasHeroOverride = Boolean(overrides.hero);
  const hasCmsOverride = Boolean(overrides.cms);
  const hasDoctorsOverride = Boolean(overrides.doctors);
  const hasServicesOverride = Boolean(overrides.services);
  const hasReviewsOverride = Boolean(overrides.reviews);

  useEffect(() => {
    let isCancelled = false;

    async function loadMissingData() {
      setIsLoading(true);
      try {
        const [hero, cms, doctors, services, reviews] = await Promise.all([
          hasHeroOverride ? Promise.resolve(overrides.hero) : loadHeroContent(),
          hasCmsOverride ? Promise.resolve(overrides.cms) : loadCmsContent(),
          hasDoctorsOverride ? Promise.resolve(overrides.doctors) : listCollection<Doctor>("doctors"),
          hasServicesOverride ? Promise.resolve(overrides.services) : listCollection<DiagnosticService>("services"),
          hasReviewsOverride ? Promise.resolve(overrides.reviews) : listCollection<Review>("reviews"),
        ]);

        if (isCancelled) {
          return;
        }

        setLoaded({
          hero,
          cms,
          doctors,
          services,
          reviews,
        });
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadMissingData();

    return () => {
      isCancelled = true;
    };
  }, [hasCmsOverride, hasDoctorsOverride, hasHeroOverride, hasReviewsOverride, hasServicesOverride, overrides.cms, overrides.doctors, overrides.hero, overrides.reviews, overrides.services]);

  const snapshot = useMemo<WebsitePreviewSnapshot>(() => {
    const base: WebsitePreviewSnapshot = {
      hero: overrides.hero ?? loaded.hero ?? DEFAULT_SNAPSHOT.hero,
      cms: overrides.cms ?? loaded.cms ?? DEFAULT_SNAPSHOT.cms,
      doctors: overrides.doctors ?? loaded.doctors ?? DEFAULT_SNAPSHOT.doctors,
      services: overrides.services ?? loaded.services ?? DEFAULT_SNAPSHOT.services,
      reviews: overrides.reviews ?? loaded.reviews ?? DEFAULT_SNAPSHOT.reviews,
    };

    if (!draftMode) {
      return base;
    }

    return {
      hero: {
        ...base.hero,
        ...(heroDraft ?? {}),
      },
      cms: mergeDefinedCmsDraft(base.cms, cmsDraft),
      doctors: mergeDoctorDraft(base.doctors, doctorDraft),
      services: mergeServiceDraft(base.services, serviceDraft),
      reviews: reviewsDraft ?? base.reviews,
    };
  }, [
    cmsDraft,
    doctorDraft,
    draftMode,
    heroDraft,
    loaded,
    overrides.cms,
    overrides.doctors,
    overrides.hero,
    overrides.reviews,
    overrides.services,
    reviewsDraft,
    serviceDraft,
  ]);

  return {
    snapshot,
    isLoading,
  };
}
