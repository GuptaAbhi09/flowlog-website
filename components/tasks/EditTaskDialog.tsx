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
import type { Client, Project, Task, TaskPriority, UpdateTask } from "@/types";

interface EditTaskDialogProps {
  task: Task | null;
  clients: Client[];
  projects: Project[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (updates: UpdateTask) => void;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function EditTaskDialog({
  task,
  clients,
  projects,
  open,
  onOpenChange,
  onSaved,
}: EditTaskDialogProps) {
  const [clientId, setClientId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  const projectsForClient = clientId
    ? projects.filter((p) => p.client_id === clientId)
    : projects;

  useEffect(() => {
    if (open && task) {
      setClientId(task.client_id ?? "");
      setProjectId(task.project_id ?? "");
      setPriority(task.priority ?? "");
    }
  }, [open, task]);

  useEffect(() => {
    if (!clientId && projectId) {
      const p = projects.find((x) => x.id === projectId);
      if (p) setClientId(p.client_id ?? "");
    }
  }, [clientId, projectId, projects]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const updates: UpdateTask = {
      client_id: clientId || null,
      project_id: projectId || null,
      priority: (priority || null) as TaskPriority | null,
    };
    onSaved?.(updates);
    onOpenChange(false);
  }

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {task.content}
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Client</label>
              <select
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setProjectId("");
                }}
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
              <label className="text-sm font-medium">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">None</option>
                {projectsForClient.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">None</option>
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
