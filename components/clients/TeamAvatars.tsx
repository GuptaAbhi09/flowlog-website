"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientMember, ClientInvite } from "@/types";

interface TeamAvatarsProps {
  members: (ClientMember & { userName: string })[];
  invites?: ClientInvite[];
  onInviteClick?: () => void;
  showInviteButton?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function TeamAvatars({ 
  members, 
  invites = [], 
  onInviteClick,
  showInviteButton = false,
  className 
}: TeamAvatarsProps) {
  // Combine unique members + invites to show activity
  const totalCount = members.length + invites.length;
  const visibleMembers = members.slice(0, 3);
  const remainingCount = totalCount - visibleMembers.length;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {visibleMembers.map((m) => (
        <Avatar key={m.id} className="h-8 w-8 border-2 border-background">
          <AvatarFallback className="text-[10px] bg-primary/10 font-bold">
            {getInitials(m.userName)}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remainingCount > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-bold">
          +{remainingCount}
        </div>
      )}

      {showInviteButton && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="ml-3 h-8 w-8 rounded-full border-dashed border-primary/40 text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-sm shrink-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onInviteClick) onInviteClick();
          }}
          title="Invite member"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
