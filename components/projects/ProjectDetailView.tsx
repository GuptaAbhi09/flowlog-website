"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderKanban, Building2, Pencil, UserPlus, Plus, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ProjectWithTasks } from "@/types";
import { getProjectDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { ProjectTimeline } from "@/components/projects/ProjectTimeline";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import { ClientTeam } from "@/components/clients/ClientTeam";
import { InviteMemberDialog } from "@/components/clients/InviteMemberDialog";
import { TaskInput } from "@/components/tasks/TaskInput";
import { TaskList } from "@/components/tasks/TaskList";
import { toggleTaskComplete, deleteTask, createTaskFromInput, cancelInvite, removeClientMember, deleteProject } from "@/lib/api";
import { useStore } from "@/store/useStore";

interface ProjectDetailViewProps {
  projectId: string;
  context: "personal" | "client";
}

export function ProjectDetailView({ projectId, context }: ProjectDetailViewProps) {
  const user = useStore(s => s.user);
  const router = useRouter();
  const [data, setData] = useState<ProjectWithTasks | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const refresh = useCallback(() => {
    getProjectDetail(projectId).then((result) => setData(result));
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProjectDetail(projectId).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, refresh]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeClientMember(memberId);
      refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return;
    try {
      await cancelInvite(inviteId);
      refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

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

  const handleBack = () => {
    if (context === "client" && project.client_id) {
      router.push(`/clients/${project.client_id}`);
    } else {
      router.push("/projects");
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {context === "client" ? "Back to Client" : "Back to Projects"}
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FolderKanban className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold truncate">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditOpen(true)}
                title="Edit project"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              {data.clientInfo?.currentRole === "owner" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete ${project.name}?`)) {
                      await deleteProject(project.id);
                      handleBack();
                    }
                  }}
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {project.client_id && (
                <span 
                  className="inline-flex items-center gap-1 cursor-pointer hover:text-primary transition-colors font-medium text-foreground/80" 
                  onClick={() => router.push(`/clients/${project.client_id}`)}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  {clientName}
                </span>
              )}
              {!project.client_id && (
                <span className="font-medium text-foreground/60">Personal Project</span>
              )}
              <span>·</span>
              <span>
                Started {format(parseISO(project.created_at), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {(data.clientInfo?.currentRole === "owner" || !project.client_id) && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-dashed border-primary/40 text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
              onClick={() => setInviteOpen(true)}
              title="Invite member"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <InviteMemberDialog
        clientId={project.client_id || undefined}
        projectId={project.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={refresh}
      />

      {/* Tabs / Content */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Active Tasks ({data.pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="timeline">Work Timeline</TabsTrigger>
          <TabsTrigger value="team">Team ({ (data.clientInfo?.members?.length ?? 0) + (data.clientInfo?.invites?.length ?? 0) })</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold">Project Backlog</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TaskInput 
                clientId={project.client_id || undefined} 
                projectId={project.id} 
                onSubmit={async (content, context) => {
                  if (!user) return;
                  await createTaskFromInput(content, user.id, "", "sod", context);
                  refresh();
                }}
                placeholder="Add a task to this project..."
              />
              <div className="pt-2">
                <TaskList
                  tasks={data.pendingTasks}
                  onToggle={async (taskId: string) => {
                    if (!user) return;
                    await toggleTaskComplete(taskId, user.id);
                    refresh();
                  }}
                  onDelete={async (taskId: string) => {
                    await deleteTask(taskId);
                    refresh();
                  }}
                  onUpdate={() => refresh()}
                  onReorder={() => {}}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Work Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectTimeline tasks={tasks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold">Project Team</CardTitle>
              {(data.clientInfo?.currentRole === "owner" || !project.client_id) && (
                <Button size="sm" variant="outline" onClick={() => setInviteOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ClientTeam 
                members={data.clientInfo?.members ?? []}
                invites={data.clientInfo?.invites ?? []}
                onRemoveMember={data.clientInfo?.currentRole === "owner" ? handleRemoveMember : undefined}
                onCancelInvite={data.clientInfo?.currentRole === "owner" ? handleCancelInvite : undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditProjectDialog
        project={project}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={refresh}
      />
    </div>
  );
}
