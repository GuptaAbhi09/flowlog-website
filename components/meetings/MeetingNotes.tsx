"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { CheckSquare, Square } from "lucide-react";
import type { Meeting } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { getOrCreateTodayLog } from "@/lib/api";
import { createTaskFromInput } from "@/lib/api";

interface MeetingNotesProps {
  meeting: Meeting;
}

export function MeetingNotes({ meeting }: MeetingNotesProps) {
  const user = useStore((s) => s.user);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [converting, setConverting] = useState(false);

  const lines = useMemo(
    () => meeting.notes.split(/\r?\n/).filter((l) => l.trim().length > 0),
    [meeting.notes],
  );

  const selectedLines = lines.filter((_, index) => selected[index]);

  const toggleLine = (index: number) => {
    setSelected((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleConvert = async () => {
    if (!user || selectedLines.length === 0) return;
    setConverting(true);
    try {
      const dayLog = await getOrCreateTodayLog(user.id);
      // Convert each selected line into a task in today's DayLog.
      await Promise.all(
        selectedLines.map((line) =>
          createTaskFromInput(line, user.id, dayLog.id, "meeting"),
        ),
      );
      // Keep notes intact; UI feedback is the responsibility of the Daily page.
    } finally {
      setConverting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Meeting Notes</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Click rows to select lines and convert them into work items. Selected
          lines will be added to today&apos;s Start of Day log.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Meeting date:{" "}
          {format(parseISO(meeting.meeting_date), "EEEE, MMMM d, yyyy")}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="max-h-80 space-y-1 overflow-y-auto rounded-md border bg-muted/30 p-2 text-sm">
          {lines.length === 0 ? (
            <p className="px-1 py-2 text-xs text-muted-foreground">
              No notes yet.
            </p>
          ) : (
            lines.map((line, index) => {
              const isSelected = !!selected[index];
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleLine(index)}
                  className="flex w-full items-start gap-2 rounded-md px-2 py-1 text-left hover:bg-accent/60"
                >
                  {isSelected ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 text-primary" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="whitespace-pre-wrap text-xs sm:text-sm">
                    {line}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <Button
          className="w-full"
          size="sm"
          onClick={handleConvert}
          disabled={!user || selectedLines.length === 0 || converting}
        >
          {converting
            ? "Converting to tasks…"
            : `Convert ${selectedLines.length || ""} line${
                selectedLines.length === 1 ? "" : "s"
              } to tasks`}
        </Button>
      </CardContent>
    </Card>
  );
}

