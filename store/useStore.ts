"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, DayLog, TimelineFilters } from "@/types";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Day Log selection
  selectedDayLog: DayLog | null;
  setSelectedDayLog: (log: DayLog | null) => void;

  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Timeline filters
  timelineFilters: TimelineFilters;
  setTimelineFilters: (filters: Partial<TimelineFilters>) => void;
  resetTimelineFilters: () => void;

  // Inbox badge count
  unprocessedInboxCount: number;
  setUnprocessedInboxCount: (count: number) => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_TIMELINE_FILTERS: TimelineFilters = {
  clientId: null,
  projectId: null,
  dateFrom: null,
  dateTo: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // ---- Auth ----
      user: null,
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          user: null,
          selectedDayLog: null,
          unprocessedInboxCount: 0,
          timelineFilters: DEFAULT_TIMELINE_FILTERS,
        }),

      // ---- Day Log ----
      selectedDayLog: null,
      setSelectedDayLog: (selectedDayLog) => set({ selectedDayLog }),

      // ---- Sidebar ----
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      // ---- Timeline ----
      timelineFilters: DEFAULT_TIMELINE_FILTERS,
      setTimelineFilters: (filters) =>
        set((s) => ({
          timelineFilters: { ...s.timelineFilters, ...filters },
        })),
      resetTimelineFilters: () =>
        set({ timelineFilters: DEFAULT_TIMELINE_FILTERS }),

      // ---- Inbox ----
      unprocessedInboxCount: 0,
      setUnprocessedInboxCount: (unprocessedInboxCount) =>
        set({ unprocessedInboxCount }),
    }),
    {
      name: "work-os-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
);
