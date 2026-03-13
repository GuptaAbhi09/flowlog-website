import { format } from "date-fns";
import { Clock3, User } from "lucide-react";
import type { TaskWithDetails } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjectTimelineProps {
  tasks: TaskWithDetails[];
}

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

export function ProjectTimeline({ tasks }: ProjectTimelineProps) {
  if (tasks.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No completed work for this project yet.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-border/60 pl-4">
      {tasks.map(({ task, completedByName }, index) => (
        <li key={task.id} className={cn("mb-6", index === tasks.length - 1 && "mb-0")}>
          <span className="absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full border border-primary bg-background" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {task.completed_at && (
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {format(new Date(task.completed_at), "MMM d, h:mm a")}
                </span>
              )}
              {completedByName && (
                <span className="inline-flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {completedByName}
                </span>
              )}
              {task.priority && (
                <Badge
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    PRIORITY_STYLES[task.priority],
                  )}
                >
                  {task.priority}
                </Badge>
              )}
            </div>
            <p className="text-sm">{task.content}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

