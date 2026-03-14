"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Plus, UserPlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { ClientWithProjects } from "@/types";
import { getClientDetail, removeClientMember } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientProjects } from "@/components/clients/ClientProjects";
import { ClientActivity } from "@/components/clients/ClientActivity";
import { ClientTeam } from "@/components/clients/ClientTeam";
import { EditClientButton } from "@/components/clients/EditClientDialog";
import { AddMemberDialog } from "@/components/clients/AddMemberDialog";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ClientWithProjects | null>(null);
  const [loading, setLoading] = useState(true);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const refresh = useCallback(() => {
    getClientDetail(params.id).then((result) => setData(result));
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getClientDetail(params.id).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
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
        <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
        </Button>
        <p className="text-muted-foreground">Client not found.</p>
      </div>
    );
  }

  const { client, projects, members } = data;

  async function handleRemoveMember(memberId: string) {
    const ok = await removeClientMember(memberId);
    if (ok) refresh();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2"
        onClick={() => router.push("/clients")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Clients
      </Button>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <EditClientButton client={client} onSaved={refresh} />
          </div>
          <p className="text-sm text-muted-foreground">
            Client since {format(parseISO(client.created_at), "MMMM yyyy")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">
            Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="team">Team ({members.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Projects</CardTitle>
              <Button size="sm" onClick={() => setCreateProjectOpen(true)}>
                <Plus className="h-4 w-4" />
                New project
              </Button>
            </CardHeader>
            <CardContent>
              <ClientProjects projects={projects} />
            </CardContent>
          </Card>
          <CreateProjectDialog
            clientId={client.id}
            open={createProjectOpen}
            onOpenChange={setCreateProjectOpen}
            onCreated={refresh}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Work Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientActivity clientId={client.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Team Members</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAddMemberOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Add member
              </Button>
            </CardHeader>
            <CardContent>
              <ClientTeam
                members={members}
                onRemoveMember={handleRemoveMember}
              />
            </CardContent>
          </Card>
          <AddMemberDialog
            clientId={client.id}
            open={addMemberOpen}
            onOpenChange={setAddMemberOpen}
            onAdded={refresh}
            existingUserIds={members.map((m) => m.user_id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
