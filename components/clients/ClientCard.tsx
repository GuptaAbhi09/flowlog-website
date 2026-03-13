"use client";

import Link from "next/link";
import { Building2, FolderKanban } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Client } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface ClientCardProps {
  client: Client;
  projectCount: number;
}

export function ClientCard({ client, projectCount }: ClientCardProps) {
  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="transition-colors hover:border-primary/40 hover:bg-accent/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold">{client.name}</h3>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FolderKanban className="h-3 w-3" />
                {projectCount} project{projectCount !== 1 ? "s" : ""}
              </span>
              <span>Since {format(parseISO(client.created_at), "MMM yyyy")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
