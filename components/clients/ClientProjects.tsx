"use client";

import Link from "next/link";
import { FolderKanban } from "lucide-react";
import type { Project, ProjectStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClientProjectsProps {
  projects: Project[];
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  planned: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  blocked: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  blocked: "Blocked",
};

export function ClientProjects({ projects }: ClientProjectsProps) {
  if (projects.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No projects yet.
      </p>
    );
  }

  return (
    <div className="divide-y">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/clients/${project.client_id}/projects/${project.id}`}
          className="flex items-center gap-3 px-1 py-3 transition-colors hover:bg-accent/50 rounded-md"
        >
          <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">{project.name}</span>
          <Badge className={cn("text-xs font-normal", STATUS_STYLES[project.status])}>
            {STATUS_LABELS[project.status]}
          </Badge>
        </Link>
      ))}
    </div>
  );
}
