"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FolderKanban, Building2, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ProjectWithTasks } from "@/types";
import { getProjectDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectTimeline } from "@/components/projects/ProjectTimeline";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ProjectWithTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const refresh = useCallback(() => {
    getProjectDetail(params.id).then((result) => setData(result));
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProjectDetail(params.id).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const { project, clientName, tasks } = data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FolderKanban className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditOpen(true)}
              title="Edit project"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {clientName}
            </span>
            <span>·</span>
            <span>
              Started {format(parseISO(project.created_at), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Work Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectTimeline tasks={tasks} />
        </CardContent>
      </Card>

      <EditProjectDialog
        project={project}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={refresh}
      />
    </div>
  );
}

