"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import type { Meeting } from "@/types";
import { getMeetings } from "@/lib/api";
import { useStore } from "@/store/useStore";
import { MeetingList } from "@/components/meetings/MeetingList";
import { CreateMeetingDialog } from "@/components/meetings/CreateMeetingDialog";
import { Button } from "@/components/ui/button";

export default function MeetingsPage() {
  const user = useStore((s) => s.user);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const refresh = useCallback(() => {
    getMeetings().then(setMeetings);
  }, []);

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Past and upcoming sessions. Convert notes into work items.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          disabled={!user}
        >
          <Plus className="h-4 w-4" />
          New meeting
        </Button>
      </div>

      <MeetingList meetings={meetings} />
      <CreateMeetingDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refresh}
        createdBy={user?.id ?? ""}
      />
    </div>
  );
}

