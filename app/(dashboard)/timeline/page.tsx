"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock3 } from "lucide-react";
import type { TimelineEntry, TimelineFilters } from "@/types";
import { getTimeline } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { TimelineFiltersBar } from "@/components/tasks/TimelineFiltersBar";
import { TimelineList } from "@/components/tasks/TimelineList";

export default function TimelinePage() {
  const filters = useStore((s) => s.timelineFilters);
  const setTimelineFilters = useStore((s) => s.setTimelineFilters);
  const resetTimelineFilters = useStore((s) => s.resetTimelineFilters);

  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(
    async (currentFilters: TimelineFilters) => {
      setLoading(true);
      try {
        const result = await getTimeline(currentFilters);
        setEntries(result);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadEntries(filters);
  }, [filters, loadEntries]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Timeline</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            Global history of all completed work items.
          </p>
        </div>
      </div>

      <TimelineFiltersBar
        value={filters}
        onChange={setTimelineFilters}
        onReset={resetTimelineFilters}
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <TimelineList entries={entries} />
      )}
    </div>
  );
}

