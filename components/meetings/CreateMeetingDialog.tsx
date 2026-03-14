"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getClients } from "@/lib/api";
import { createMeeting } from "@/lib/api";
import type { Client, Meeting } from "@/types";

interface CreateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (meeting: Meeting) => void;
  createdBy: string;
}

export function CreateMeetingDialog({
  open,
  onOpenChange,
  onCreated,
  createdBy,
}: CreateMeetingDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("09:00");
  const [clientId, setClientId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setTitle("");
      setNotes("");
      const now = new Date();
      setMeetingDate(now.toISOString().slice(0, 10));
      setMeetingTime(
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      );
      setClientId("");
      getClients().then(setClients);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }
    const dateTime = new Date(`${meetingDate}T${meetingTime}`).toISOString();
    setSubmitting(true);
    try {
      const meeting = await createMeeting({
        title: trimmed,
        notes: notes.trim(),
        meeting_date: dateTime,
        created_by: createdBy,
        client_id: clientId || null,
      });
      onOpenChange(false);
      onCreated?.(meeting);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create meeting.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="meeting-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="meeting-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Meeting title"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="meeting-client" className="text-sm font-medium">
                Client (optional)
              </label>
              <select
                id="meeting-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">None</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <label htmlFor="meeting-date" className="text-sm font-medium">
                  Date
                </label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="meeting-time" className="text-sm font-medium">
                  Time
                </label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="meeting-notes" className="text-sm font-medium">
                Notes (optional)
              </label>
              <Textarea
                id="meeting-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Meeting notes…"
                rows={3}
                className="resize-none"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
