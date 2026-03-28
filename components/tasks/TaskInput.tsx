"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Sparkles, Building2, FolderKanban, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseTaskInput as parseTags } from "@/lib/parsers/taskParser";
import { parseTaskInputLogic } from "@/lib/parsers/intelligentTaskParser";
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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getClients().then(setAllClients).catch(() => {});
    getProjects().then(setAllProjects).catch(() => {});
  }, []);

  const parsedTags = value.trim() ? parseTags(value) : null;
  const intelligentParsed = value.trim() ? parseTaskInputLogic(value, allClients, allProjects) : null;

  const handleInputChange = (val: string) => {
    setValue(val);
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
    const lastTriggerIndex = value.lastIndexOf(suggestionType === "client" ? "@" : suggestionType === "project" ? "#" : "!");
    if (lastTriggerIndex === -1) return;

    const prefix = value.slice(0, lastTriggerIndex);
    const suffix = value.slice(value.indexOf(" ", lastTriggerIndex));
    const newSuffix = suffix.startsWith(" ") ? suffix : " ";

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
    <div className="relative group/input">
      <div className={cn(
        "flex flex-col gap-2 rounded-xl border bg-card p-1.5 transition-all duration-200",
        isFocused ? "ring-2 ring-primary/20 border-primary shadow-sm" : "border-border",
        disabled && "opacity-50 pointer-events-none"
      )}>
        <div className="flex items-center gap-2 px-1">
          <div className="flex-shrink-0 ml-1.5">
            <Plus className={cn("h-4 w-4 transition-colors", isFocused ? "text-primary" : "text-muted-foreground/50")} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => { setSuggestionType(null); setSuggestions([]); }, 200);
            }}
            placeholder={placeholder || "What's on your mind? (use @, #, !)"}
            className="flex-1 bg-transparent py-2 text-sm font-medium outline-none placeholder:text-muted-foreground/40"
            disabled={submitting}
          />
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || submitting}
            size="sm"
            className={cn("h-8 rounded-lg px-3 transition-opacity", value.trim() ? "opacity-100" : "opacity-0 pointer-events-none")}
          >
            {submitting ? "Processing…" : "Add"}
          </Button>
        </div>

        {intelligentParsed && (intelligentParsed.clientName || intelligentParsed.projectName || intelligentParsed.priority) ? (
          <div className="flex flex-wrap items-center gap-1.5 border-t pt-1.5 px-2 animate-in slide-in-from-top-1">
            {intelligentParsed.clientName && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider py-0 px-2 h-5 border-none",
                  intelligentParsed.matchDetails.client.confidence < 1 ? "bg-primary/5 text-primary/60 italic" : "bg-primary/5 text-primary"
                )}
              >
                {intelligentParsed.matchDetails.client.confidence < 1 ? <Sparkles className="mr-1 h-3 w-3" /> : <Building2 className="mr-1 h-3 w-3" />}
                {intelligentParsed.clientName}
                {intelligentParsed.matchDetails.client.confidence < 1 && (
                  <span className="ml-1 opacity-50 text-[8px]">{Math.round(intelligentParsed.matchDetails.client.confidence * 100)}%</span>
                )}
              </Badge>
            )}
            {intelligentParsed.projectName && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider py-0 px-2 h-5 border-none",
                  intelligentParsed.matchDetails.project.confidence < 1 ? "bg-blue-50 text-blue-400 italic" : "bg-blue-50 text-blue-600"
                )}
              >
                {intelligentParsed.matchDetails.project.confidence < 1 ? <Sparkles className="mr-1 h-3 w-3" /> : <FolderKanban className="mr-1 h-3 w-3" />}
                {intelligentParsed.projectName}
                {intelligentParsed.matchDetails.project.confidence < 1 && (
                  <span className="ml-1 opacity-50 text-[8px]">{Math.round(intelligentParsed.matchDetails.project.confidence * 100)}%</span>
                )}
              </Badge>
            )}
            {intelligentParsed.priority && (
              <Badge
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider py-0 px-2 h-5 border-none",
                  PRIORITY_COLORS[intelligentParsed.priority],
                )}
              >
                <AlertCircle className="mr-1 h-3 w-3" />
                {intelligentParsed.priority}
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 border-t pt-1.5 px-3">
            <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tight">
              <span className="text-primary/40 font-black">@</span> client
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tight">
              <span className="text-blue-500/40 font-black">#</span> project
            </div>
            <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tight">
              <span className="text-red-500/40 font-black">!</span> priority
            </div>
          </div>
        )}
      </div>

      {suggestionType && suggestions.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full sm:w-72 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="p-1.5">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-b mb-1">
              Select {suggestionType}
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={item.id}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  idx === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent/30"
                )}
                onClick={() => applySuggestion(item)}
              >
                {item.type === "client" && <Building2 className="h-4 w-4 opacity-50" />}
                {item.type === "project" && <FolderKanban className="h-4 w-4 opacity-50" />}
                {item.type === "priority" && <AlertCircle className="h-4 w-4 opacity-50" />}
                <span className="truncate font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
