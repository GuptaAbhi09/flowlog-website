"use client";

import { useEffect, useState, useCallback } from "react";
import { format, isToday, parseISO } from "date-fns";
import { CalendarDays, RotateCcw } from "lucide-react";
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Workspace</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{dateLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Calendar date picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Pick date
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-2">
              <Calendar
                mode="single"
                selected={
                  currentLog ? parseISO(currentLog.date) : new Date()
                }
                onSelect={handleSelectDate}
              />
            </PopoverContent>
          </Popover>

          {/* Go to Today button (when viewing a past log) */}
          {!isViewingToday && (
            <Button size="sm" onClick={handleGoToToday}>
              Go to Today
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <Tabs defaultValue="sod">
        <TabsList>
          <TabsTrigger value="sod">
            Start of Day
          </TabsTrigger>
          <TabsTrigger value="eod">
            End of Day
          </TabsTrigger>
        </TabsList>

        {/* SOD Tab */}
        <TabsContent value="sod" className="mt-4 space-y-4">
          {/* Task input (only when viewing today) */}
          {isViewingToday && (
            <TaskInput onSubmit={handleAddTask} />
          )}

          {/* Task list */}
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
            onUpdateTask={isViewingToday ? handleUpdateTask : undefined}
            onReorder={handleReorder}
            readonly={!isViewingToday}
          />

          {/* Roll pending button (for past logs with pending items) */}
          {!isViewingToday && hasPending && (
            <Card>
              <CardContent className="flex items-center justify-between py-4">
                <p className="text-sm text-muted-foreground">
                  {tasks.filter((t) => !t.is_completed).length} pending item(s)
                  from this day.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={handleRollPending}
                  disabled={rolling}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {rolling ? "Rolling…" : "Roll Pending to Today"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* EOD Tab */}
        <TabsContent value="eod" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">End of Day Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <EODSummary tasks={tasks} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
