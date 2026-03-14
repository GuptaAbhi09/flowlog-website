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
import { updateMeeting } from "@/lib/api";
import type { Client, Meeting } from "@/types";

interface EditMeetingDialogProps {
  meeting: Meeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (meeting: Meeting | null) => void;
}

export function EditMeetingDialog({
  meeting,
  open,
  onOpenChange,
  onSaved,
}: EditMeetingDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [title, setTitle] = useState(meeting.title);
  const [notes, setNotes] = useState(meeting.notes);
  const [clientId, setClientId] = useState(meeting.client_id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(meeting.title);
      setNotes(meeting.notes);
      setClientId(meeting.client_id ?? "");
      setError(null);
      getClients().then(setClients);
    }
  }, [open, meeting.title, meeting.notes, meeting.client_id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await updateMeeting(meeting.id, {
        title: trimmed,
        notes: notes.trim(),
        client_id: clientId || null,
      });
      onOpenChange(false);
      onSaved?.(updated ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update meeting.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-meeting-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="edit-meeting-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Meeting title"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="edit-meeting-client" className="text-sm font-medium">
                Client (optional)
              </label>
              <select
                id="edit-meeting-client"
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
            <div className="grid gap-2">
              <label htmlFor="edit-meeting-notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="edit-meeting-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Meeting notes…"
                rows={4}
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
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
