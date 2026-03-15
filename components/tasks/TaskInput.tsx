"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Building2, FolderKanban, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseTaskInput } from "@/lib/parsers/taskParser";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getClients, getProjects } from "@/lib/api";
import type { Client, Project } from "@/types";

interface SuggestionItem {
  id: string;
  label: string;
  type: "client" | "project" | "priority";
}

const PRIORITIES: SuggestionItem[] = [
  { id: "high", label: "high", type: "priority" },
  { id: "medium", label: "medium", type: "priority" },
  { id: "low", label: "low", type: "priority" },
];

interface TaskInputProps {
  onSubmit: (raw: string, context?: { clientId?: string; projectId?: string }) => Promise<void>;
  clientId?: string;
  projectId?: string;
  disabled?: boolean;
  placeholder?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

export function TaskInput({ onSubmit, clientId, projectId, disabled, placeholder }: TaskInputProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [suggestionType, setSuggestionType] = useState<"client" | "project" | "priority" | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Background fetch clients/projects for suggestions
    getClients().then(setAllClients).catch(() => {});
    getProjects().then(setAllProjects).catch(() => {});
  }, []);

  const parsed = value.trim() ? parseTaskInput(value) : null;

  const handleInputChange = (val: string) => {
    setValue(val);
    
    // Find the last trigger character
    const lastWordMatch = val.match(/[@#!][\w\s]*$/);
    if (!lastWordMatch) {
      setSuggestionType(null);
      setSuggestions([]);
      return;
    }

    const trigger = lastWordMatch[0][0];
    const query = lastWordMatch[0].slice(1).toLowerCase();

    if (trigger === "@") {
      setSuggestionType("client");
      setSuggestions(
        allClients
          .filter(c => c.name.toLowerCase().includes(query))
          .map(c => ({ id: c.id, label: c.name, type: "client" as const }))
          .slice(0, 5)
      );
    } else if (trigger === "#") {
      setSuggestionType("project");
      setSuggestions(
        allProjects
          .filter(p => p.name.toLowerCase().includes(query))
          .map(p => ({ id: p.id, label: p.name, type: "project" as const }))
          .slice(0, 5)
      );
    } else if (trigger === "!") {
      setSuggestionType("priority");
      setSuggestions(
        PRIORITIES.filter(p => p.label.includes(query))
      );
    }
    setSelectedIndex(0);
  };

  const applySuggestion = (item: SuggestionItem) => {
    const val = value;
    const lastTriggerIndex = val.lastIndexOf(suggestionType === "client" ? "@" : suggestionType === "project" ? "#" : "!");
    if (lastTriggerIndex === -1) return;

    const prefix = val.slice(0, lastTriggerIndex);
    const suffix = val.slice(val.indexOf(" ", lastTriggerIndex)); // keep rest of string if user typed space after
    const newSuffix = suffix.startsWith(" ") ? suffix : " "; // Ensure space after tag

    const tag = suggestionType === "client" ? "@" : suggestionType === "project" ? "#" : "!";
    const newValue = `${prefix}${tag}${item.label}${newSuffix}`;
    
    setValue(newValue);
    setSuggestionType(null);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(trimmed, { clientId, projectId });
      setValue("");
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestionType && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applySuggestion(suggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        setSuggestionType(null);
        setSuggestions([]);
      }
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative space-y-2">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => { setSuggestionType(null); setSuggestions([]); }, 200)}
          placeholder={placeholder || "Add work item… (use @Client #Project !high)"}
          disabled={disabled || submitting}
          className="flex-1"
        />
        <Button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled || submitting}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {suggestionType && suggestions.length > 0 && (
        <div className="absolute left-0 top-[40px] z-50 w-64 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1">
            {suggestions.map((item, idx) => (
              <button
                key={item.id}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                  idx === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
                onClick={() => applySuggestion(item)}
              >
                {item.type === "client" && <Building2 className="h-3.5 w-3.5 opacity-70" />}
                {item.type === "project" && <FolderKanban className="h-3.5 w-3.5 opacity-70" />}
                {item.type === "priority" && <AlertCircle className="h-3.5 w-3.5 opacity-70" />}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {parsed && (parsed.clientName || parsed.projectName || parsed.priority) && (
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          {parsed.clientName && (
            <Badge variant="outline" className="text-xs font-normal">
              @{parsed.clientName}
            </Badge>
          )}
          {parsed.projectName && (
            <Badge variant="outline" className="text-xs font-normal">
              #{parsed.projectName}
            </Badge>
          )}
          {parsed.priority && (
            <Badge
              className={cn(
                "text-xs font-normal",
                PRIORITY_COLORS[parsed.priority],
              )}
            >
              !{parsed.priority}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
