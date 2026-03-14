"use client";

import type { ClientMember, ClientInvite } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMinus, Mail, X } from "lucide-react";

interface ClientTeamProps {
  members: (ClientMember & { userName: string })[];
  invites?: ClientInvite[];
  onRemoveMember?: (memberId: string) => void;
  onCancelInvite?: (inviteId: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ClientTeam({ 
  members, 
  invites = [], 
  onRemoveMember,
  onCancelInvite 
}: ClientTeamProps) {
  if (members.length === 0 && invites.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No team members yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
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
            {onRemoveMember && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => onRemoveMember(member.id)}
                title="Remove member"
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {invites.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Pending Invitations
          </h4>
          <div className="divide-y rounded-lg border bg-muted/20 px-3">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center gap-3 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{invite.email}</p>
                  <p className="text-[10px] capitalize text-muted-foreground">
                    {invite.role}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  Pending
                </Badge>
                {onCancelInvite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onCancelInvite(invite.id)}
                    title="Cancel invite"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
