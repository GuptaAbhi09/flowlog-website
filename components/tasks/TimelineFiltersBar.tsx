"use client";

import { useEffect, useState } from "react";
import type { Client, Project, TimelineFilters } from "@/types";
import { getClients, getProjects } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TimelineFiltersBarProps {
  value: TimelineFilters;
  onChange: (filters: Partial<TimelineFilters>) => void;
  onReset: () => void;
}

export function TimelineFiltersBar({
  value,
  onChange,
  onReset,
}: TimelineFiltersBarProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getClients(), getProjects()]).then(([c, p]) => {
      if (!cancelled) {
        setClients(c);
        setProjects(p);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const active =
    value.clientId || value.projectId || value.dateFrom || value.dateTo;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Client filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-[120px] justify-between">
            <span className="truncate">
              {value.clientId
                ? clients.find((c) => c.id === value.clientId)?.name ?? "Client"
                : "Client"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2">
          <button
            type="button"
            className={cn(
              "w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent",
              !value.clientId && "bg-accent/60",
            )}
            onClick={() => onChange({ clientId: null })}
          >
            All clients
          </button>
          <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
            {clients.map((client) => (
              <button
                key={client.id}
                type="button"
                className={cn(
                  "w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent",
                  value.clientId === client.id && "bg-accent/60",
                )}
                onClick={() => onChange({ clientId: client.id })}
              >
                {client.name}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Project filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-[140px] justify-between">
            <span className="truncate">
              {value.projectId
                ? projects.find((p) => p.id === value.projectId)?.name ?? "Project"
                : "Project"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <button
            type="button"
            className={cn(
              "w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent",
              !value.projectId && "bg-accent/60",
            )}
            onClick={() => onChange({ projectId: null })}
          >
            All projects
          </button>
          <div className="mt-1 max-h-48 space-y-1 overflow-y-auto">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={cn(
                  "w-full rounded-md px-2 py-1 text-left text-sm hover:bg-accent",
                  value.projectId === project.id && "bg-accent/60",
                )}
                onClick={() => onChange({ projectId: project.id })}
              >
                {project.name}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Date range (simple YYYY-MM-DD inputs) */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>From</span>
        <Input
          type="date"
          value={value.dateFrom ?? ""}
          onChange={(e) =>
            onChange({ dateFrom: e.target.value || null })
          }
          className="h-8 w-36"
          max={value.dateTo ?? undefined}
        />
        <span>To</span>
        <Input
          type="date"
          value={value.dateTo ?? ""}
          onChange={(e) =>
            onChange({ dateTo: e.target.value || null })
          }
          className="h-8 w-36"
          min={value.dateFrom ?? undefined}
        />
      </div>

      {active && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          Reset
        </Button>
      )}
    </div>
  );
}

