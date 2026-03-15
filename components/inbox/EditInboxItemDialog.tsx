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
import { Textarea } from "@/components/ui/textarea";
import type { InboxItem } from "@/types";

interface EditInboxItemDialogProps {
  item: InboxItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (content: string) => void;
}

export function EditInboxItemDialog({
  item,
  open,
  onOpenChange,
  onSaved,
}: EditInboxItemDialogProps) {
  const [content, setContent] = useState(item?.content ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && item) {
      setContent(item.content);
      setError(null);
    }
  }, [open, item]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Content is required.");
      return;
    }
    setSubmitting(true);
    onSaved?.(trimmed);
    onOpenChange(false);
    setSubmitting(false);
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit inbox item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="inbox-edit-content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="inbox-edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Item content…"
                rows={3}
                className="resize-none"
                autoFocus
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
