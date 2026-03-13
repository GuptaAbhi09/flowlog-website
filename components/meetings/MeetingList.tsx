"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { CalendarDays, Building2 } from "lucide-react";
import type { Meeting } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { getClientById } from "@/lib/mockData";

interface MeetingListProps {
  meetings: Meeting[];
}

export function MeetingList({ meetings }: MeetingListProps) {
  if (meetings.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No meetings yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {meetings.map((meeting) => {
        const client = meeting.client_id
          ? getClientById(meeting.client_id)
          : null;

        return (
          <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
            <Card className="transition-colors hover:border-primary/40 hover:bg-accent/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">
                    {meeting.title}
                  </h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {format(
                        parseISO(meeting.meeting_date),
                        "EEE, MMM d • h:mm a",
                      )}
                    </span>
                    {client && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {client.name}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

