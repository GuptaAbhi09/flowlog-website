"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import type { Task } from "@/types";
import { getUserById, getClientById, getProjectById } from "@/lib/mockData";
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

function CompletedItem({ task }: { task: Task }) {
  const completedBy = task.completed_by ? getUserById(task.completed_by) : null;
  const clientName = task.client_id ? getClientById(task.client_id)?.name : null;
  const projectName = task.project_id ? getProjectById(task.project_id)?.name : null;

  return (
    <div className="flex items-start gap-3 py-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm">{task.content}</span>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {completedBy && <span>{completedBy.name}</span>}
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
          {clientName && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
              {clientName}
            </Badge>
          )}
          {projectName && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
              {projectName}
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

  if (tasks.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No work items to summarize.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h4 className="mb-1 flex items-center gap-2 text-sm font-medium text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Completed ({completed.length})
          </h4>
          <div className="divide-y">
            {completed.map((t) => (
              <CompletedItem key={t.id} task={t} />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && pending.length > 0 && <Separator />}

      {/* Pending */}
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
