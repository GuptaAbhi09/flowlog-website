"use client";

import { useState, useRef, useEffect } from "react";
import { GripVertical, Pencil, Trash2, Check, X, Settings2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskPriority } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  clientName?: string | null;
  projectName?: string | null;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, content: string) => void;
  onEditDetails?: () => void;
  readonly?: boolean;
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

export function TaskItem({
  task,
  clientName,
  projectName,
  onToggle,
  onDelete,
  onUpdate,
  onEditDetails,
  readonly = false,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.content);
  const editRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: readonly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  const commitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.content) {
      onUpdate(task.id, trimmed);
    }
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(task.content);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-4 rounded-xl border bg-card px-4 py-3 transition-all duration-200",
        isDragging && "z-50 shadow-lg scale-[1.01] bg-accent/10 border-primary/20",
        task.is_completed && "opacity-50 grayscale-[0.5]",
      )}
    >
      {/* Drag handle */}
      {!readonly && (
        <button
          className="mt-1 flex-shrink-0 cursor-grab touch-none text-muted-foreground/30 hover:text-muted-foreground transition-all duration-200 lg:opacity-0 lg:group-hover:opacity-100 max-lg:opacity-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      {/* Checkbox Container */}
      <div className="mt-1 flex-shrink-0">
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={() => onToggle(task.id)}
          disabled={readonly}
          className="h-5 w-5 rounded-full border-2 transition-all data-[state=checked]:scale-110"
        />
      </div>

      {/* Content Area */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              ref={editRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitEdit}
              className="w-full bg-secondary/50 rounded-lg h-9 px-3 text-sm font-medium outline-none border focus:border-primary transition-colors"
            />
          </div>
        ) : (
          <span
            className={cn(
              "text-sm font-medium leading-relaxed tracking-tight transition-all",
              task.is_completed ? "text-muted-foreground line-through" : "text-foreground"
            )}
          >
            {task.content}
          </span>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          {task.priority && (
            <Badge className={cn("text-[10px] h-5 font-bold uppercase tracking-wider px-2 border-none transition-transform hover:scale-105", PRIORITY_STYLES[task.priority])}>
              {task.priority}
            </Badge>
          )}
          {clientName && (
            <Badge variant="outline" className="text-[10px] h-5 font-bold uppercase tracking-wider px-2 bg-transparent opacity-80 border-border">
              {clientName}
            </Badge>
          )}
          {projectName && (
            <Badge variant="outline" className="text-[10px] h-5 font-bold uppercase tracking-wider px-2 bg-transparent opacity-80 border-border">
              {projectName}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      {!readonly && !editing && (
        <div className="flex items-center gap-1 opacity-0 transition-all duration-200 translate-x-1 lg:group-hover:opacity-100 lg:group-hover:translate-x-0 max-lg:opacity-100 max-lg:translate-x-0">
          {onEditDetails && (
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground transition-colors"
              onClick={onEditDetails}
              title="Work Category"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground transition-colors"
            onClick={() => {
              setEditValue(task.content);
              setEditing(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-lg bg-secondary/50 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
