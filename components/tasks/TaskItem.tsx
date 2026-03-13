"use client";

import { useState, useRef, useEffect } from "react";
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react";
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
        "group flex items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-colors",
        isDragging && "z-50 shadow-lg opacity-90",
        task.is_completed && "opacity-60",
      )}
    >
      {/* Drag handle */}
      {!readonly && (
        <button
          className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      {/* Checkbox */}
      <Checkbox
        checked={task.is_completed}
        onCheckedChange={() => onToggle(task.id)}
        disabled={readonly}
      />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              ref={editRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commitEdit}
              className="h-7 text-sm"
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={commitEdit}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <span
            className={cn(
              "text-sm",
              task.is_completed && "line-through text-muted-foreground",
            )}
          >
            {task.content}
          </span>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1">
          {task.priority && (
            <Badge className={cn("text-[10px] px-1.5 py-0", PRIORITY_STYLES[task.priority])}>
              {task.priority}
            </Badge>
          )}
          {clientName && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
              {clientName}
            </Badge>
          )}
          {projectName && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
              {projectName}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      {!readonly && !editing && (
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground"
            onClick={() => {
              setEditValue(task.content);
              setEditing(true);
            }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
