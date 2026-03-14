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
import { Pencil } from "lucide-react";
import { updateClient } from "@/lib/api";
import type { Client } from "@/types";

interface EditClientDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (client: Client | null) => void;
}

export function EditClientDialog({
  client,
  open,
  onOpenChange,
  onSaved,
}: EditClientDialogProps) {
  const [name, setName] = useState(client.name);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(client.name);
      setError(null);
    }
  }, [open, client.name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await updateClient(client.id, { name: trimmed });
      onOpenChange(false);
      onSaved?.(updated ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update client.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="edit-client-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="edit-client-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client name"
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

export function EditClientButton({
  client,
  onSaved,
}: {
  client: Client;
  onSaved?: (client: Client | null) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} title="Edit client">
        <Pencil className="h-4 w-4" />
      </Button>
      <EditClientDialog
        client={client}
        open={open}
        onOpenChange={setOpen}
        onSaved={onSaved}
      />
    </>
  );
}
