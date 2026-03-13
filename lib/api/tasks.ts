import type { Task, CreateTask, UpdateTask } from "@/types";
import { tasks, dayLogs, getClientByName, getProjectByName } from "@/lib/mockData";
import { parseTaskInput } from "@/lib/parsers/taskParser";
import { delay, generateId } from "./helpers";
import { getOrCreateTodayLog } from "./dayLogs";

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** All tasks for a given day log, sorted by position. */
export async function getTasksByDayLogId(dayLogId: string): Promise<Task[]> {
  const result = tasks
    .filter((t) => t.day_log_id === dayLogId)
    .sort((a, b) => a.position - b.position);
  return delay(result);
}

/** All tasks for a user on a given date. */
export async function getTasksByDate(
  userId: string,
  date: string,
): Promise<Task[]> {
  const log = dayLogs.find((d) => d.user_id === userId && d.date === date);
  if (!log) return delay([]);
  return getTasksByDayLogId(log.id);
}

/** All completed tasks (across all day logs) for a given client. */
export async function getCompletedTasksByClient(
  clientId: string,
): Promise<Task[]> {
  const result = tasks
    .filter((t) => t.client_id === clientId && t.is_completed)
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));
  return delay(result);
}

/** All completed tasks for a given project. */
export async function getCompletedTasksByProject(
  projectId: string,
): Promise<Task[]> {
  const result = tasks
    .filter((t) => t.project_id === projectId && t.is_completed)
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));
  return delay(result);
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Create a task from raw user input.
 * Parses @Client #Project !priority tags automatically.
 */
export async function createTaskFromInput(
  rawInput: string,
  userId: string,
  dayLogId: string,
  source: Task["source"] = "sod",
): Promise<Task> {
  const parsed = parseTaskInput(rawInput);

  const client = parsed.clientName
    ? getClientByName(parsed.clientName)
    : undefined;
  const project = parsed.projectName
    ? getProjectByName(parsed.projectName)
    : undefined;

  const existingTasks = tasks.filter((t) => t.day_log_id === dayLogId);
  const maxPos = existingTasks.length > 0
    ? Math.max(...existingTasks.map((t) => t.position))
    : -1;

  const task: Task = {
    id: generateId("task"),
    content: rawInput,
    day_log_id: dayLogId,
    user_id: userId,
    client_id: client?.id ?? null,
    project_id: project?.id ?? null,
    priority: parsed.priority,
    is_completed: false,
    completed_at: null,
    completed_by: null,
    position: maxPos + 1,
    source,
    created_at: new Date().toISOString(),
  };

  tasks.push(task);
  return delay(task);
}

/** Create a task with explicit fields (used by inbox conversion, etc.). */
export async function createTask(data: CreateTask): Promise<Task> {
  const existingTasks = tasks.filter((t) => t.day_log_id === data.day_log_id);
  const maxPos = existingTasks.length > 0
    ? Math.max(...existingTasks.map((t) => t.position))
    : -1;

  const task: Task = {
    ...data,
    id: generateId("task"),
    is_completed: false,
    completed_at: null,
    completed_by: null,
    position: data.position ?? maxPos + 1,
    created_at: new Date().toISOString(),
  };

  tasks.push(task);
  return delay(task);
}

/** Update any mutable field on a task. */
export async function updateTask(
  taskId: string,
  updates: UpdateTask,
): Promise<Task | null> {
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return delay(null);

  tasks[idx] = { ...tasks[idx], ...updates };
  return delay(tasks[idx]);
}

/** Mark a task complete (or uncomplete). */
export async function toggleTaskComplete(
  taskId: string,
  userId: string,
): Promise<Task | null> {
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return delay(null);

  const task = tasks[idx];
  const nowCompleted = !task.is_completed;

  tasks[idx] = {
    ...task,
    is_completed: nowCompleted,
    completed_at: nowCompleted ? new Date().toISOString() : null,
    completed_by: nowCompleted ? userId : null,
  };

  return delay(tasks[idx]);
}

/** Delete a task. */
export async function deleteTask(taskId: string): Promise<boolean> {
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return delay(false);
  tasks.splice(idx, 1);
  return delay(true);
}

/** Reorder tasks within a day log by providing the new ordered list of IDs. */
export async function reorderTasks(
  dayLogId: string,
  orderedIds: string[],
): Promise<Task[]> {
  orderedIds.forEach((id, position) => {
    const idx = tasks.findIndex(
      (t) => t.id === id && t.day_log_id === dayLogId,
    );
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], position };
    }
  });

  return getTasksByDayLogId(dayLogId);
}

/**
 * Roll pending (incomplete) tasks from a source day log into today's log.
 * Creates copies — originals are left unchanged in the old day log.
 */
export async function rollPendingToToday(
  sourceDayLogId: string,
  userId: string,
): Promise<Task[]> {
  const todayLog = await getOrCreateTodayLog(userId);

  const pending = tasks.filter(
    (t) => t.day_log_id === sourceDayLogId && !t.is_completed,
  );

  const newTasks: Task[] = [];

  for (const original of pending) {
    const copied: Task = {
      ...original,
      id: generateId("task"),
      day_log_id: todayLog.id,
      position: tasks.filter((t) => t.day_log_id === todayLog.id).length,
      created_at: new Date().toISOString(),
    };
    tasks.push(copied);
    newTasks.push(copied);
  }

  return delay(newTasks);
}
