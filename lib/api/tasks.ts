import type { Task, CreateTask, UpdateTask } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { parseTaskInput } from "@/lib/parsers/taskParser";
import { getClientByName } from "./clients";
import { getProjectByName } from "./projects";
import { getOrCreateTodayLog } from "./dayLogs";

/** All tasks for a given day log, sorted by position. */
export async function getTasksByDayLogId(dayLogId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("day_log_id", dayLogId)
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

/** All tasks for a user on a given date. */
export async function getTasksByDate(
  userId: string,
  date: string,
): Promise<Task[]> {
  const { data: log } = await supabase
    .from("day_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (!log) return [];
  return getTasksByDayLogId(log.id);
}

/** All completed tasks (across all day logs) for a given client. */
export async function getCompletedTasksByClient(
  clientId: string,
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_completed", true)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

/** All completed tasks for a given project. */
export async function getCompletedTasksByProject(
  projectId: string,
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_completed", true)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

/**
 * Create a task from raw user input.
 * Parses @Client #Project !priority tags automatically.
 * Can take optional context (clientId, projectId) to use if not specified in input.
 */
export async function createTaskFromInput(
  rawInput: string,
  userId: string,
  dayLogId: string,
  source: Task["source"] = "sod",
  context?: { clientId?: string; projectId?: string },
): Promise<Task> {
  const parsed = parseTaskInput(rawInput);

  let client_id = context?.clientId ?? null;
  let project_id = context?.projectId ?? null;

  if (parsed.clientName) {
    const c = await getClientByName(parsed.clientName);
    if (c) client_id = c.id;
  }
  if (parsed.projectName) {
    const p = await getProjectByName(parsed.projectName);
    if (p) project_id = p.id;
  }

  const { data: existing } = await supabase
    .from("tasks")
    .select("position")
    .eq("day_log_id", dayLogId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const maxPos = (existing as { position?: number } | null)?.position ?? -1;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      content: parsed.content, // Use parsed content (tags removed)
      day_log_id: dayLogId,
      user_id: userId,
      client_id,
      project_id,
      priority: parsed.priority,
      is_completed: false,
      completed_at: null,
      completed_by: null,
      position: maxPos + 1,
      source,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return task as Task;
}

/** Create a task with explicit fields (used by inbox conversion, etc.). */
export async function createTask(data: CreateTask): Promise<Task> {
  const { data: existing } = await supabase
    .from("tasks")
    .select("position")
    .eq("day_log_id", data.day_log_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const maxPos = (existing as { position?: number } | null)?.position ?? -1;
  const position = data.position ?? maxPos + 1;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      ...data,
      is_completed: false,
      completed_at: null,
      completed_by: null,
      position,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return task as Task;
}

/** Update any mutable field on a task. */
export async function updateTask(
  taskId: string,
  updates: UpdateTask,
): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .maybeSingle();

  if (error) return null;
  return data as Task | null;
}

/** Mark a task complete (or uncomplete). */
export async function toggleTaskComplete(
  taskId: string,
  userId: string,
): Promise<Task | null> {
  const { data: current, error: fetchError } = await supabase
    .from("tasks")
    .select("is_completed")
    .eq("id", taskId)
    .single();

  if (fetchError || !current) return null;

  const nowCompleted = !(current as Task).is_completed;

  const { data, error } = await supabase
    .from("tasks")
    .update({
      is_completed: nowCompleted,
      completed_at: nowCompleted ? new Date().toISOString() : null,
      completed_by: nowCompleted ? userId : null,
    })
    .eq("id", taskId)
    .select()
    .maybeSingle();

  if (error) return null;
  return data as Task | null;
}

/** Delete a task. */
export async function deleteTask(taskId: string): Promise<boolean> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  return !error;
}

/** Reorder tasks within a day log by providing the new ordered list of IDs. */
export async function reorderTasks(
  dayLogId: string,
  orderedIds: string[],
): Promise<Task[]> {
  await Promise.all(
    orderedIds.map((id, position) =>
      supabase.from("tasks").update({ position }).eq("id", id).eq("day_log_id", dayLogId),
    ),
  );
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

  const { data: pending, error: fetchErr } = await supabase
    .from("tasks")
    .select("*")
    .eq("day_log_id", sourceDayLogId)
    .eq("is_completed", false);

  if (fetchErr) throw new Error(fetchErr.message);
  if (!pending?.length) return [];

  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("day_log_id", todayLog.id);

  let nextPos = count ?? 0;

  const inserts = (pending as Task[]).map((t) => ({
    content: t.content,
    day_log_id: todayLog.id,
    user_id: t.user_id,
    client_id: t.client_id,
    project_id: t.project_id,
    priority: t.priority,
    is_completed: false,
    completed_at: null,
    completed_by: null,
    position: nextPos++,
    source: t.source,
  }));

  const { data: newTasks, error: insertErr } = await supabase
    .from("tasks")
    .insert(inserts)
    .select();

  if (insertErr) throw new Error(insertErr.message);
  return (newTasks ?? []) as Task[];
}

/** Fetch tasks by source, optionally filtered by client or project. */
export async function getTasksBySource(
  source: Task["source"],
  clientId?: string,
): Promise<Task[]> {
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("source", source)
    .order("created_at", { ascending: false });

  if (clientId) query = query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}
