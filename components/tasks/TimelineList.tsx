import { format, parseISO } from "date-fns";
import { CalendarDays, User, Building2, FolderKanban } from "lucide-react";
import type { TimelineEntry } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineListProps {
  entries: TimelineEntry[];
}

export function TimelineList({ entries }: TimelineListProps) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No completed work matches the selected filters yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const date = parseISO(entry.date);
        return (
          <Card key={entry.task.id}>
            <CardContent className="flex gap-3 p-3">
              <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(date, "EEE, MMM d • h:mm a")}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {entry.completedByName}
                  </span>
                  {entry.clientName && (
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {entry.clientName}
                    </span>
                  )}
                  {entry.projectName && (
                    <span className="inline-flex items-center gap-1">
                      <FolderKanban className="h-3 w-3" />
                      {entry.projectName}
                    </span>
                  )}
                </div>
                <p className="text-sm">{entry.task.content}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

