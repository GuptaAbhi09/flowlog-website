"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Building2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Project } from "@/types";
import { getProjects, getClients } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clientMap, setClientMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [projs, clients] = await Promise.all([
      getProjects(),
      getClients(),
    ]);
    setProjects(projs);
    const map: Record<string, string> = {};
    clients.forEach((c) => {
      map[c.id] = c.name;
    });
    setClientMap(map);
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <FolderKanban className="h-4 w-4" />
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-12 text-muted-foreground">
          <FolderKanban className="h-8 w-8" />
          <p className="text-sm">No projects yet. Create one from a client.</p>
          <Link
            href="/clients"
            className="text-sm font-medium text-primary hover:underline"
          >
            Go to Clients
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="transition-colors hover:border-primary/40 hover:bg-accent/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FolderKanban className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">
                      {project.name}
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {clientMap[project.client_id] && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {clientMap[project.client_id]}
                        </span>
                      )}
                      <span>
                        {format(parseISO(project.created_at), "MMM yyyy")}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProjectStatusBadge status={project.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
