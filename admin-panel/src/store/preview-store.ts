"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CmsContent, DiagnosticService, Doctor, HeroContent, Review } from "@/types";
import type { PreviewDevice, PreviewSection } from "@/features/preview/types";

interface PreviewState {
  section: PreviewSection;
  device: PreviewDevice;
  draftMode: boolean;
  heroDraft: Partial<HeroContent> | null;
  cmsDraft: Partial<CmsContent> | null;
  doctorDraft: Doctor | null;
  serviceDraft: DiagnosticService | null;
  reviewsDraft: Review[] | null;
  setSection: (section: PreviewSection) => void;
  setDevice: (device: PreviewDevice) => void;
  setDraftMode: (enabled: boolean) => void;
  setHeroDraft: (draft: Partial<HeroContent> | null) => void;
  setCmsDraft: (draft: Partial<CmsContent> | null) => void;
  setDoctorDraft: (draft: Doctor | null) => void;
  setServiceDraft: (draft: DiagnosticService | null) => void;
  setReviewsDraft: (draft: Review[] | null) => void;
  clearDrafts: () => void;
}

export const usePreviewStore = create<PreviewState>()(
  persist(
    (set) => ({
      section: "homepage",
      device: "desktop",
      draftMode: true,
      heroDraft: null,
      cmsDraft: null,
      doctorDraft: null,
      serviceDraft: null,
      reviewsDraft: null,
      setSection: (section) => set({ section }),
      setDevice: (device) => set({ device }),
      setDraftMode: (draftMode) => set({ draftMode }),
      setHeroDraft: (heroDraft) => set({ heroDraft }),
      setCmsDraft: (cmsDraft) => set({ cmsDraft }),
      setDoctorDraft: (doctorDraft) => set({ doctorDraft }),
      setServiceDraft: (serviceDraft) => set({ serviceDraft }),
      setReviewsDraft: (reviewsDraft) => set({ reviewsDraft }),
      clearDrafts: () =>
        set({
          heroDraft: null,
          cmsDraft: null,
          doctorDraft: null,
          serviceDraft: null,
          reviewsDraft: null,
        }),
    }),
    {
      name: "hospaccx-admin-preview",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        section: state.section,
        device: state.device,
        draftMode: state.draftMode,
        heroDraft: state.heroDraft,
        cmsDraft: state.cmsDraft,
        doctorDraft: state.doctorDraft && {
          ...state.doctorDraft,
          imageUrl:
            state.doctorDraft.imageUrl?.startsWith("blob:") || state.doctorDraft.imageUrl?.startsWith("data:")
              ? undefined
              : state.doctorDraft.imageUrl,
        },
        serviceDraft: state.serviceDraft,
        reviewsDraft: state.reviewsDraft,
      }),
    },
  ),
);
