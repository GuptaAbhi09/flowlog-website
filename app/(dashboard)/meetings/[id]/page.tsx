"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Building2, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Meeting } from "@/types";
import { getMeetingById, getClientById } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MeetingNotes } from "@/components/meetings/MeetingNotes";
import { EditMeetingDialog } from "@/components/meetings/EditMeetingDialog";

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const refresh = useCallback(() => {
    getMeetingById(params.id).then(setMeeting);
  }, [params.id]);

  useEffect(() => {
    if (!meeting?.client_id) {
      setClientName(null);
      return;
    }
    let cancelled = false;
    getClientById(meeting.client_id).then((client) => {
      if (!cancelled && client) setClientName(client.name);
    });
    return () => {
      cancelled = true;
    };
  }, [meeting?.client_id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/meetings")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meetings
        </Button>
        <p className="text-muted-foreground">Meeting not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => router.push("/meetings")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Meetings
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <CalendarDays className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditOpen(true)}
              title="Edit meeting"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {format(
                parseISO(meeting.meeting_date),
                "EEEE, MMMM d, yyyy • h:mm a",
              )}
            </span>
            {clientName && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {clientName}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <MeetingNotes meeting={meeting} />
      <EditMeetingDialog
        meeting={meeting}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={refresh}
      />
    </div>
  );
}

