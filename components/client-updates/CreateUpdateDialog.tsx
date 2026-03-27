"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createClientUpdate, updateClientUpdate } from "@/lib/api";
import { useStore } from "@/store/useStore";
import type { ClientUpdate } from "@/types";

interface CreateUpdateDialogProps {
  onSaved?: (update: ClientUpdate) => void;
  trigger?: React.ReactNode;
  editingUpdate?: ClientUpdate;
}

export function CreateUpdateDialog({ onSaved, trigger, editingUpdate }: CreateUpdateDialogProps) {
  const user = useStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState(editingUpdate?.client_name ?? "");
  const [lastUpdate, setLastUpdate] = useState(editingUpdate?.last_update ?? "");
  const [nextSteps, setNextSteps] = useState(editingUpdate?.next_steps ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmedName = clientName.trim();
    if (!trimmedName) {
      setError("Client name is required.");
      return;
    }
    if (!user) {
      setError("You must be signed in.");
      return;
    }
    setSubmitting(true);
    try {
      let result: ClientUpdate | null;
      if (editingUpdate) {
        result = await updateClientUpdate(editingUpdate.id, {
          client_name: trimmedName,
          last_update: lastUpdate,
          next_steps: nextSteps,
        });
      } else {
        result = await createClientUpdate({
          user_id: user.id,
          client_name: trimmedName,
          last_update: lastUpdate,
          next_steps: nextSteps,
        });
      }

      if (result) {
        if (!editingUpdate) {
          setClientName("");
          setLastUpdate("");
          setNextSteps("");
        }
        setOpen(false);
        onSaved?.(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save update.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Update
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingUpdate ? "Edit Update" : "New Client Update"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="client-name" className="text-sm font-medium">
                Client Name
              </label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Who is the client?"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="last-update" className="text-sm font-medium">
                What happened last?
              </label>
              <Textarea
                id="last-update"
                value={lastUpdate}
                onChange={(e) => setLastUpdate(e.target.value)}
                placeholder="Details of the last discussion..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="next-steps" className="text-sm font-medium">
                What tasks remain?
              </label>
              <Textarea
                id="next-steps"
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                placeholder="What do I have to do next?"
                rows={2}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
