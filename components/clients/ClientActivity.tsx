"use client";

import { useEffect, useState } from "react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import type { Task } from "@/types";
import { getClientActivity } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ClientActivityProps {
  clientId: string;
}

interface ActivityGroup {
  date: string;
  tasks: (Task & { userName: string })[];
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDateHeader(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMMM d");
}

export function ClientActivity({ clientId }: ClientActivityProps) {
  const [groups, setGroups] = useState<ActivityGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getClientActivity(clientId).then((data) => {
      if (!cancelled) {
        setGroups(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No completed work yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.date}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {formatDateHeader(group.date)}
          </h4>
          <div className="space-y-2">
            {group.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30"
              >
                <div className="mt-1">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{task.content}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Avatar className="h-5 w-5 border">
                      <AvatarFallback className="text-[8px]">
                        {getInitials(task.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground/80">{task.userName}</span>
                      {task.completed_at && (
                        <>
                          <span>·</span>
                          <span>{format(parseISO(task.completed_at), "h:mm a")}</span>
                        </>
                      )}
                      {task.priority && (
                        <Badge
                          className={cn(
                            "text-[8px] px-1 py-0 leading-none",
                            PRIORITY_STYLES[task.priority],
                          )}
                        >
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
