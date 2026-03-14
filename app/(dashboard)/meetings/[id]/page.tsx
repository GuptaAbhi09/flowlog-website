"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Building2, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Meeting, Task } from "@/types";
import { getMeetingById, getClientById, getTasksBySource } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MeetingNotes } from "@/components/meetings/MeetingNotes";
import { EditMeetingDialog } from "@/components/meetings/EditMeetingDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getMeetingById(params.id);
    setMeeting(data);
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMeetingById(params.id).then((result) => {
      if (!cancelled) {
        setMeeting(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
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

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  const refreshTasks = useCallback(async () => {
    if (!meeting?.client_id) return;
    setTasksLoading(true);
    try {
      const result = await getTasksBySource("meeting", meeting.client_id);
      setTasks(result);
    } finally {
      setTasksLoading(false);
    }
  }, [meeting?.client_id]);

  useEffect(() => {
    if (meeting?.client_id) {
      refreshTasks();
    }
  }, [meeting?.client_id, refreshTasks]);

  const refreshAll = useCallback(() => {
    refresh();
    refreshTasks();
  }, [refresh, refreshTasks]);

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

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <MeetingNotes meeting={meeting} onConverted={refreshTasks} />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Related Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <p className="text-sm text-muted-foreground">Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks generated from meetings yet.</p>
              ) : (
                <ul className="space-y-3">
                  {tasks.map((task) => (
                    <li key={task.id} className="flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50">
                      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${task.is_completed ? "bg-green-500" : "bg-blue-500"}`} />
                      <div className="min-w-0 flex-1">
                        <p className={task.is_completed ? "text-muted-foreground line-through" : ""}>
                          {task.content}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {format(parseISO(task.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EditMeetingDialog
        meeting={meeting}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={refreshAll}
      />
    </div>
  );
}

