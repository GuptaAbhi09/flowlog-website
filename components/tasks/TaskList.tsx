"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { Task, UpdateTask, Client, Project } from "@/types";
import { getClientById, getProjectById, getClients, getProjects } from "@/lib/api";
import { TaskItem } from "./TaskItem";
import { EditTaskDialog } from "./EditTaskDialog";

interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, content: string) => void;
  onUpdateTask?: (taskId: string, updates: UpdateTask) => void;
  onReorder: (orderedIds: string[]) => void;
  readonly?: boolean;
}

export function TaskList({
  tasks,
  onToggle,
  onDelete,
  onUpdate,
  onUpdateTask,
  onReorder,
  readonly = false,
}: TaskListProps) {
  const [namesMap, setNamesMap] = useState<Record<string, { clientName: string | null; projectName: string | null }>>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const tasksKey = tasks.map((t) => `${t.id}-${t.client_id}-${t.project_id}`).join(",");

  useEffect(() => {
    if (tasks.length === 0) return;

    let cancelled = false;

    const load = async () => {
      const map: Record<string, { clientName: string | null; projectName: string | null }> = {};
      for (const t of tasks) {
        const [client, project] = await Promise.all([
          t.client_id ? getClientById(t.client_id) : null,
          t.project_id ? getProjectById(t.project_id) : null,
        ]);
        if (cancelled) return;
        map[t.id] = {
          clientName: client?.name ?? null,
          projectName: project?.name ?? null,
        };
      }
      if (!cancelled) setNamesMap(map);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [tasksKey, tasks]);

  useEffect(() => {
    if (!onUpdateTask) return;
    let cancelled = false;
    Promise.all([getClients(), getProjects()]).then(([c, p]) => {
      if (!cancelled) {
        setClients(c);
        setProjects(p);
      }
    });
    return () => { cancelled = true; };
  }, [onUpdateTask]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...tasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onReorder(reordered.map((t) => t.id));
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No work items yet. Add one above.
      </div>
    );
  }

  return (
    <>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {tasks.map((task) => {
            const names = namesMap[task.id];
            return (
              <TaskItem
                key={task.id}
                task={task}
                clientName={names?.clientName ?? null}
                projectName={names?.projectName ?? null}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onEditDetails={onUpdateTask ? () => setEditingTaskId(task.id) : undefined}
                readonly={readonly}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
    {onUpdateTask && (
      <EditTaskDialog
        task={editingTaskId ? tasks.find((t) => t.id === editingTaskId) ?? null : null}
        clients={clients}
        projects={projects}
        open={!!editingTaskId}
        onOpenChange={(open) => !open && setEditingTaskId(null)}
        onSaved={(updates) => {
          if (editingTaskId) {
            onUpdateTask(editingTaskId, updates);
            setEditingTaskId(null);
          }
        }}
      />
    )}
  </>
  );
}
