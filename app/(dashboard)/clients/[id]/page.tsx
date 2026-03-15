"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Plus, UserPlus, CheckCircle2, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientProjects } from "@/components/clients/ClientProjects";
import { ClientActivity } from "@/components/clients/ClientActivity";
import { ClientTeam } from "@/components/clients/ClientTeam";
import { EditClientButton } from "@/components/clients/EditClientDialog";
import { InviteMemberDialog } from "@/components/clients/InviteMemberDialog";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { 
  getClientDetail, 
  removeClientMember, 
  getInvitesByClient, 
  declineInvite,
  deleteClient
} from "@/lib/api";
import type { ClientInvite, ClientWithProjects } from "@/types";

import { useSearchParams } from "next/navigation";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const accepted = searchParams.get("accepted") === "true";
  const router = useRouter();
  const [data, setData] = useState<ClientWithProjects | null>(null);
  const [invites, setInvites] = useState<ClientInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const refreshData = useCallback(async () => {
    const [clientResult, invitesResult] = await Promise.all([
      getClientDetail(params.id),
      getInvitesByClient(params.id)
    ]);
    setData(clientResult);
    setInvites(invitesResult);
  }, [params.id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refreshData().then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [refreshData]);

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
    if (ok) refreshData();
  }

  async function handleCancelInvite(inviteId: string) {
    await declineInvite(inviteId);
    refreshData();
  }

  return (
    <div className="space-y-6">
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
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold truncate">{client.name}</h1>
              <EditClientButton client={client} onSaved={refreshData} />
              {data.currentRole === "owner" && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to delete ${client.name}? This will remove all projects and data.`)) {
                      await deleteClient(client.id);
                      router.push("/clients");
                    }
                  }}
                  title="Delete client"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Client since {format(parseISO(client.created_at), "MMMM yyyy")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {data.currentRole === "owner" && (
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

      {accepted && (
        <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 flex items-center gap-2 border border-green-500/20 animate-in fade-in slide-in-from-top-1">
          <CheckCircle2 className="h-4 w-4" />
          You have successfully joined the team!
        </div>
      )}

      <InviteMemberDialog
        clientId={client.id}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={refreshData}
      />

      {/* Tabs */}
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">
            Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="team">
            Team ({members.length + invites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Projects</CardTitle>
              {data.currentRole === "owner" && (
                <Button size="sm" onClick={() => setCreateProjectOpen(true)}>
                  <Plus className="h-4 w-4" />
                  New project
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ClientProjects projects={projects} />
            </CardContent>
          </Card>
          <CreateProjectDialog
            clientId={client.id}
            open={createProjectOpen}
            onOpenChange={setCreateProjectOpen}
            onCreated={refreshData}
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
              {data.currentRole === "owner" && (
                <Button size="sm" variant="outline" onClick={() => setInviteOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <ClientTeam
                members={members}
                invites={invites}
                onRemoveMember={data.currentRole === "owner" ? handleRemoveMember : undefined}
                onCancelInvite={data.currentRole === "owner" ? handleCancelInvite : undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

