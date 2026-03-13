"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseTaskInput } from "@/lib/parsers/taskParser";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskInputProps {
  onSubmit: (raw: string) => Promise<void>;
  disabled?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

export function TaskInput({ onSubmit, disabled }: TaskInputProps) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = value.trim() ? parseTaskInput(value) : null;

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue("");
      inputRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add work item… (use @Client #Project !high)"
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
