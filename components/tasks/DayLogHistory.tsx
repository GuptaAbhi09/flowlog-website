"use client";

import { format, isToday, isYesterday, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { DayLog } from "@/types";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DayLogHistoryProps {
  logs: DayLog[];
  selectedDate: string | null;
  onSelect: (log: DayLog) => void;
}

function formatDayLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEE, MMM d");
}

export function DayLogHistory({ logs, selectedDate, onSelect }: DayLogHistoryProps) {
  if (logs.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No day log history yet.
      </p>
    );
  }

  return (
    <ScrollArea className="max-h-64">
      <div className="flex flex-col gap-1">
        {logs.map((log) => (
          <Button
            key={log.id}
            variant="ghost"
            size="sm"
            className={cn(
              "justify-start gap-2 font-normal",
              selectedDate === log.date && "bg-accent font-medium",
            )}
            onClick={() => onSelect(log)}
          >
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{formatDayLabel(log.date)}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {format(parseISO(log.date), "MMM d")}
            </span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
