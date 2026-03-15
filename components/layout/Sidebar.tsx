"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Building2,
  FolderKanban,
  MessageSquare,
  Inbox,
  Clock,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { label: "Daily", href: "/daily", icon: CalendarDays },
  { label: "Client Projects", href: "/clients", icon: Building2 },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Meetings", href: "/meetings", icon: MessageSquare },
  { label: "Inbox", href: "/inbox", icon: Inbox, hasBadge: true },
  { label: "Timeline", href: "/timeline", icon: Clock },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const unprocessedInboxCount = useStore((s) => s.unprocessedInboxCount);

  return (
    <nav className="flex flex-col gap-1 px-3 py-2">
      {NAV_ITEMS.filter((item) => !("hidden" in item && item.hidden)).map(
        (item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {"hasBadge" in item && unprocessedInboxCount > 0 && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "h-5 min-w-5 justify-center px-1.5 text-xs",
                    isActive && "bg-primary-foreground/20 text-primary-foreground",
                  )}
                >
                  {unprocessedInboxCount}
                </Badge>
              )}
            </Link>
          );
        },
      )}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-52 flex-col border-r bg-card lg:flex">
      <div className="flex h-14 items-center border-b px-5">
        <Link href="/daily" className="flex items-center">
          <img src="/assets/flowlog.png" alt="FlowLog" className="h-11 w-auto object-contain" />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto pt-2">
        <SidebarNav />
      </div>
    </aside>
  );
}
