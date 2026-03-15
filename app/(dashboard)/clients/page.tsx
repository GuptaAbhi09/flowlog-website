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

  return (
    <div className="px-3 py-6 sm:px-4 sm:py-8 space-y-8 sm:space-y-10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Client Projects</h1>
          <p className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground font-medium">
            <Building2 className="h-4 w-4 text-primary/60" />
            {loading ? (
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <span>{clients.length} active client{clients.length !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        {!loading && (
          <div className="flex justify-center sm:justify-end">
            <CreateClientDialog onCreated={refresh} />
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-500">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 w-full bg-muted/40 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-muted/50 p-12 lg:p-20 transition-all hover:bg-muted/5">
          <div className="rounded-full bg-muted/20 p-4">
            <Building2 className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground/80">No clients yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start by adding your first client to manage projects.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
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
