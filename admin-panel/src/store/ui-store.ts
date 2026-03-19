"use client";

import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  theme: "light" | "dark";
  setSidebarOpen: (open: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,
  theme: "light",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  setTheme: (theme) => set({ theme }),
}));
