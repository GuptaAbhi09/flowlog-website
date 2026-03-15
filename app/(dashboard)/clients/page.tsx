"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import type { Client, Project } from "@/types";
import { getClients, getProjects } from "@/lib/api";
import { ClientCard } from "@/components/clients/ClientCard";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    Promise.all([getClients(), getProjects()]).then(([c, p]) => {
      setClients(c);
      setProjects(p);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getClients(), getProjects()]).then(([c, p]) => {
      if (!cancelled) {
        setClients(c);
        setProjects(p);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Client Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateClientDialog onCreated={refresh} />
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-12 text-muted-foreground">
          <Building2 className="h-8 w-8" />
          <p className="text-sm">No clients yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              projectCount={projects.filter((p) => p.client_id === client.id).length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
