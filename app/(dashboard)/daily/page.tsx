"use client";

import { useEffect, useState, useCallback } from "react";
import { format, isToday, parseISO } from "date-fns";
import { CalendarDays, RotateCcw, Plus } from "lucide-react";
import { useStore } from "@/store/useStore";
import type { DayLog, Task, UpdateTask } from "@/types";
import {
  getOrCreateTodayLog,
  getDayLogByDate,
  getTasksByDayLogId,
  createTaskFromInput,
  toggleTaskComplete,
  deleteTask,
  updateTask,
  reorderTasks,
  rollPendingToToday,
  createDayLogForDate,
} from "@/lib/api";
import { TaskInput } from "@/components/tasks/TaskInput";
import { TaskList } from "@/components/tasks/TaskList";
import { EODSummary } from "@/components/tasks/EODSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function DailyPage() {
  const user = useStore((s) => s.user);

  const [currentLog, setCurrentLog] = useState<DayLog | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolling, setRolling] = useState(false);

  // ---- Data fetching -------------------------------------------------------

  const loadTasks = useCallback(async (dayLogId: string) => {
    const result = await getTasksByDayLogId(dayLogId);
    setTasks(result);
  }, []);

  const initToday = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const log = await getOrCreateTodayLog(user.id);
      setCurrentLog(log);
      await loadTasks(log.id);
    } finally {
      setLoading(false);
    }
  }, [user, loadTasks]);

  useEffect(() => {
    initToday();
  }, [initToday]);

  // ---- Actions -------------------------------------------------------------

  const handleAddTask = async (raw: string) => {
    if (!user || !currentLog) return;
    await createTaskFromInput(raw, user.id, currentLog.id, "sod");
    await loadTasks(currentLog.id);
  };

  const handleToggle = async (taskId: string) => {
    if (!user) return;
    await toggleTaskComplete(taskId, user.id);
    if (currentLog) await loadTasks(currentLog.id);
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    if (currentLog) await loadTasks(currentLog.id);
  };

  const handleUpdate = async (taskId: string, content: string) => {
    await updateTask(taskId, { content });
    if (currentLog) await loadTasks(currentLog.id);
  };

  const handleUpdateTask = async (taskId: string, updates: UpdateTask) => {
    await updateTask(taskId, updates);
    if (currentLog) await loadTasks(currentLog.id);
  };

  const handleReorder = async (orderedIds: string[]) => {
    if (!currentLog) return;
    const result = await reorderTasks(currentLog.id, orderedIds);
    setTasks(result);
  };

  const handleSelectDate = async (date: Date | undefined) => {
    if (!user || !date) return;
    const iso = format(date, "yyyy-MM-dd");

    if (iso === format(new Date(), "yyyy-MM-dd")) {
      await initToday();
      return;
    }

    const existing = await getDayLogByDate(user.id, iso);
    const log = existing ?? (await createDayLogForDate(user.id, iso));
    setCurrentLog(log);
    await loadTasks(log.id);
  };

  const handleGoToToday = async () => {
    await initToday();
  };

  const handleRollPending = async () => {
    if (!user || !currentLog) return;
    setRolling(true);
    try {
      await rollPendingToToday(currentLog.id, user.id);
      await initToday();
    } finally {
      setRolling(false);
    }
  };

  // ---- Derived state -------------------------------------------------------

  const isViewingToday = currentLog ? isToday(parseISO(currentLog.date)) : false;
  const hasPending = tasks.some((t) => !t.is_completed);
  const dateLabel = currentLog
    ? isViewingToday
      ? "Today"
      : format(parseISO(currentLog.date), "EEEE, MMMM d, yyyy")
    : "";

  // ---- Render --------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Daily Workspace</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {loading ? (
              <div className="h-4 w-32 animate-pulse bg-muted rounded" />
            ) : (
              <span>{dateLabel}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" disabled={loading}>
                <CalendarDays className="h-4 w-4" />
                Pick date
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0 border-none">
              <Calendar
                mode="single"
                selected={
                  currentLog ? parseISO(currentLog.date) : new Date()
                }
                onSelect={handleSelectDate}
                className="rounded-lg border shadow-md"
              />
            </PopoverContent>
          </Popover>

          {!isViewingToday && !loading && (
            <Button size="sm" onClick={handleGoToToday}>
              Go to Today
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="space-y-4">
            <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
            <div className="space-y-2">
              <div className="h-16 w-full bg-muted/50 animate-pulse rounded-lg" />
              <div className="h-16 w-full bg-muted/50 animate-pulse rounded-lg" />
              <div className="h-16 w-full bg-muted/50 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="sod" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="sod">
              Start of Day
            </TabsTrigger>
            <TabsTrigger value="eod">
              End of Day
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sod" className="space-y-6 outline-none">
            {isViewingToday && (
              <div className="space-y-2">
                <TaskInput onSubmit={handleAddTask} />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Tasks
                </h2>
              </div>
              <TaskList
                tasks={tasks}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onUpdateTask={isViewingToday ? handleUpdateTask : undefined}
                onReorder={handleReorder}
                readonly={!isViewingToday}
              />
            </div>

            {!isViewingToday && hasPending && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-primary">Pending items found</p>
                    <p className="text-xs text-muted-foreground">
                      {tasks.filter((t) => !t.is_completed).length} items remaining from this day.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={handleRollPending}
                    disabled={rolling}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {rolling ? "Rolling…" : "Roll to Today"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="eod" className="outline-none">
            <Card>
              <CardHeader className="pb-3 border-b mb-4">
                <CardTitle className="text-base">End of Day Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <EODSummary tasks={tasks} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
