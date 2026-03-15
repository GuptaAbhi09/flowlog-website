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
import { createProject, getClients } from "@/lib/api";
import type { Client, Project, ProjectStatus } from "@/types";
import { useStore } from "@/store/useStore";

interface CreateProjectDialogProps {
  /** If set, client is fixed and client selector is hidden */
  clientId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (project: Project) => void;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "blocked", label: "Blocked" },
];

export function CreateProjectDialog({
  clientId: fixedClientId,
  open,
  onOpenChange,
  onCreated,
}: CreateProjectDialogProps) {
  const user = useStore(s => s.user);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState(fixedClientId ?? "");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("in_progress");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setName("");
      setStatus("in_progress");
      setClientId(fixedClientId ?? "");
      if (!fixedClientId) getClients().then(setClients);
    }
  }, [open, fixedClientId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    const cid = fixedClientId ?? clientId;
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    if (!user) {
      setError("You must be logged in.");
      return;
    }
    setSubmitting(true);
    try {
      const project = await createProject({ 
        client_id: cid || null, 
        user_id: user.id,
        name: trimmed, 
        status 
      });
      onOpenChange(false);
      onCreated?.(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!fixedClientId && (
              <div className="grid gap-2">
                <label htmlFor="project-client" className="text-sm font-medium">
                  Client (Optional)
                </label>
                <select
                  id="project-client"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">No Client (Personal)</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="project-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="project-status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="project-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
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
