"use client";

import type { ClientMember } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ClientTeamProps {
  members: (ClientMember & { userName: string })[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ClientTeam({ members }: ClientTeamProps) {
  if (members.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No team members yet.
      </p>
    );
  }

  return (
    <div className="divide-y">
      {members.map((member) => (
        <div key={member.id} className="flex items-center gap-3 py-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(member.userName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{member.userName}</p>
          </div>
          <Badge
            variant={member.role === "owner" ? "default" : "secondary"}
            className="text-xs capitalize"
          >
            {member.role}
          </Badge>
        </div>
      ))}
    </div>
  );
}
