"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Task } from "@/types";
import {
  getProfiles,
  getClients,
  getProjects,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface EODSummaryProps {
  tasks: Task[];
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

interface TaskDetails {
  completedByName: string | null;
  clientName: string | null;
  projectName: string | null;
}

function CompletedItem({
  task,
  details,
}: {
  task: Task;
  details: TaskDetails | null;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm">{task.content}</span>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {details?.completedByName && <span>{details.completedByName}</span>}
          {task.completed_at && (
            <>
              <span>·</span>
              <span>{format(new Date(task.completed_at), "h:mm a")}</span>
            </>
          )}
          {task.priority && (
            <Badge className={cn("text-[10px] px-1.5 py-0", PRIORITY_STYLES[task.priority])}>
              {task.priority}
            </Badge>
          )}
          {details?.clientName && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
              {details.clientName}
            </Badge>
          )}
          {details?.projectName && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
              {details.projectName}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function PendingItem({ task }: { task: Task }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <span className="text-sm text-muted-foreground">{task.content}</span>
    </div>
  );
}

export function EODSummary({ tasks }: EODSummaryProps) {
  const completed = tasks
    .filter((t) => t.is_completed)
    .sort((a, b) => (a.completed_at ?? "").localeCompare(b.completed_at ?? ""));
  const pending = tasks.filter((t) => !t.is_completed);

  const [detailsMap, setDetailsMap] = useState<Record<string, TaskDetails>>({});
  const completedIds = completed.map((t) => t.id).join(",");

  useEffect(() => {
    if (completed.length === 0) return;

    let cancelled = false;

    const load = async () => {
      try {
        const [allProfiles, allClients, allProjects] = await Promise.all([
          getProfiles(),
          getClients(),
          getProjects(),
        ]);

        const map: Record<string, TaskDetails> = {};
        
        const profileMap = new Map(allProfiles.map(p => [p.id, p.name]));
        const clientMap = new Map(allClients.map(c => [c.id, c.name]));
        const projectMap = new Map(allProjects.map(p => [p.id, p.name]));

        for (const t of completed) {
          map[t.id] = {
            completedByName: t.completed_by ? profileMap.get(t.completed_by) ?? null : null,
            clientName: t.client_id ? clientMap.get(t.client_id) ?? null : null,
            projectName: t.project_id ? projectMap.get(t.project_id) ?? null : null,
          };
        }

        if (!cancelled) setDetailsMap(map);
      } catch (err) {
        console.error("Failed to load EOD metadata:", err);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [completedIds, completed]);

  if (tasks.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No work items to summarize.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {completed.length > 0 && (
        <div>
          <h4 className="mb-1 flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Completed ({completed.length})
          </h4>
          <div className="divide-y">
            {completed.map((t) => (
              <CompletedItem key={t.id} task={t} details={detailsMap[t.id] ?? null} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && pending.length > 0 && <Separator />}

      {pending.length > 0 && (
        <div>
          <h4 className="mb-1 flex items-center gap-2 text-sm font-medium text-amber-600">
            <Clock className="h-4 w-4" />
            Pending ({pending.length})
          </h4>
          <div className="divide-y">
            {pending.map((t) => (
              <PendingItem key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
