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
import { getClients, getProjects } from "@/lib/api";
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
      try {
        // Fetch all dependencies in parallel once
        const [allClients, allProjects] = await Promise.all([
          getClients(),
          getProjects(),
        ]);

        const map: Record<string, { clientName: string | null; projectName: string | null }> = {};
        
        // Build local lookup maps for speed
        const clientMap = new Map(allClients.map(c => [c.id, c.name]));
        const projectMap = new Map(allProjects.map(p => [p.id, p.name]));

        for (const t of tasks) {
          map[t.id] = {
            clientName: t.client_id ? clientMap.get(t.client_id) ?? null : null,
            projectName: t.project_id ? projectMap.get(t.project_id) ?? null : null,
          };
        }

        if (!cancelled) {
          setNamesMap(map);
          setClients(allClients); // Optimization: Reuse this for the dialog too
          setProjects(allProjects);
        }
      } catch (err) {
        console.error("Failed to load task metadata:", err);
      }
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
            // Priority 1: Use names already attached to the task (zero latency)
            // Priority 2: Use names from the metadata map (fallback/sync)
            const meta = namesMap[task.id];
            const tWithNames = task as Task & { clientName?: string; projectName?: string };
            const clientName = tWithNames.clientName ?? meta?.clientName ?? null;
            const projectName = tWithNames.projectName ?? meta?.projectName ?? null;

            return (
              <TaskItem
                key={task.id}
                task={task}
                clientName={clientName}
                projectName={projectName}
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
