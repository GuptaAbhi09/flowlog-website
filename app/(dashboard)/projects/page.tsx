"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Project } from "@/types";
import { getProjects } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      // Filter for projects without a client (Personal Projects)
      const projs = await getProjects({ onlyPersonal: true });
      setProjects(projs);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refresh().then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personal Projects</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <FolderKanban className="h-4 w-4" />
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FolderKanban className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No personal projects yet</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
              Create a project that isn't tied to a specific client to track your personal work.
            </p>
          </div>
          <Button variant="outline" onClick={() => setCreateOpen(true)}>
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="group transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.98]">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold">
                      {project.name}
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        Created {format(parseISO(project.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="mt-2">
                      <ProjectStatusBadge status={project.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onCreated={() => refresh()}
      />
    </div>
  );
}
