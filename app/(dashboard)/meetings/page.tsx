"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import type { Meeting } from "@/types";
import { getMeetings } from "@/lib/api";
import { MeetingList } from "@/components/meetings/MeetingList";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMeetings().then((result) => {
      if (!cancelled) {
        setMeetings(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meetings</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          Past and upcoming sessions. Convert notes into work items.
        </p>
      </div>

      <MeetingList meetings={meetings} />
    </div>
  );
}

