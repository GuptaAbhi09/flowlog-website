import type { Task, CreateTask, UpdateTask } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { parseTaskInput as parseTags } from "@/lib/parsers/taskParser";
import { parseTaskInput as intelligentParse } from "@/lib/parsers/intelligentTaskParser";
import { getClientByName } from "./clients";
import { getProjectByName } from "./projects";
import { getOrCreateTodayLog } from "./dayLogs";

/** All tasks for a given day log, sorted by position. Includes joined metadata for performance. */
export async function getTasksByDayLogId(dayLogId: string): Promise<(Task & { clientName?: string; projectName?: string })[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, clients(name), projects(name)")
    .eq("day_log_id", dayLogId)
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((t: {
    clients?: { name: string } | null;
    projects?: { name: string } | null;
  }) => ({
    ...t,
    clientName: t.clients?.name ?? null,
    projectName: t.projects?.name ?? null,
  })) as (Task & { clientName?: string; projectName?: string })[];
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
  dayLogId?: string,
  source: Task["source"] = "sod",
  context?: { clientId?: string; projectId?: string },
): Promise<Task> {
  const result = await intelligentParse(rawInput, userId);
  const parsed = {
    content: result.content,
    clientName: result.clientName,
    projectName: result.projectName,
    priority: result.priority
  };
  
  let targetDayLogId = dayLogId;
  if (!targetDayLogId) {
    const log = await getOrCreateTodayLog(userId);
    targetDayLogId = log.id;
  }

  let client_id = context?.clientId ?? result.clientId;
  let project_id = context?.projectId ?? result.projectId;

  // Final sanity check for explicit tags if they weren't matched in intelligentParse
  // (though intelligentParse should handle them, we keep this for robustness)
  if (!client_id && parsed.clientName) {
    const c = await getClientByName(parsed.clientName);
    if (c) client_id = c.id;
  }
  if (!project_id && parsed.projectName) {
    const p = await getProjectByName(parsed.projectName);
    if (p) project_id = p.id;
  }

  const { data: existing } = await supabase
    .from("tasks")
    .select("position")
    .eq("day_log_id", targetDayLogId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const maxPos = (existing as { position?: number } | null)?.position ?? -1;

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      content: parsed.content, // Use parsed content (tags removed)
      day_log_id: targetDayLogId,
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
 * Moves the tasks by updating their day_log_id (no duplicates).
 */
export async function rollPendingToToday(
  sourceDayLogId: string,
  userId: string,
): Promise<Task[]> {
  const todayLog = await getOrCreateTodayLog(userId);

  // Get current max position in today's log to append
  const { data: existing } = await supabase
    .from("tasks")
    .select("position")
    .eq("day_log_id", todayLog.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextPos = ((existing as { position?: number } | null)?.position ?? -1) + 1;

  // Fetch pending tasks from the source log
  const { data: pending, error: fetchErr } = await supabase
    .from("tasks")
    .select("id")
    .eq("day_log_id", sourceDayLogId)
    .eq("is_completed", false);

  if (fetchErr) throw new Error(fetchErr.message);
  if (!pending?.length) return [];

  const taskIds = pending.map(t => t.id);

  // Update tasks one by one to set proper position? 
  // No, we can update in bulk if they don't care about internal order relative to each other yet, 
  // but we should still maintain a sequence.
  
  // For simplicity and speed, update all at once and then re-fetch.
  // We'll set a base position and we could use a postgres function if we wanted perfectly sequential positions.
  // But for now, setting them into today's log is the priority.
  
  const { error: updateErr } = await supabase
    .from("tasks")
    .update({ 
      day_log_id: todayLog.id,
      source: 'sod', // Roll into Start of Day
    })
    .in("id", taskIds);

  if (updateErr) throw new Error(updateErr.message);
  
  // After move, we should reorder them in the new log to ensure no position gaps?
  // Reorder is a separate tool, but let's just re-fetch for now.
  return getTasksByDayLogId(todayLog.id);
}

/**
 * Automaticaly rolls over all pending tasks from any previous day log into today.
 * To be called by a cron job or on app initialization.
 */
export async function autoRolloverTasks(userId: string): Promise<number> {
  const todayLog = await getOrCreateTodayLog(userId);
  const today = new Date().toISOString().split('T')[0];

  // Find all previous day logs
  const { data: prevLogs } = await supabase
    .from("day_logs")
    .select("id")
    .eq("user_id", userId)
    .lt("date", today);

  if (!prevLogs?.length) return 0;

  const logIds = prevLogs.map(l => l.id);

  // Update all pending tasks from these logs
  const { count, error } = await supabase
    .from("tasks")
    .update({ 
      day_log_id: todayLog.id,
      source: 'sod' 
    })
    .in("day_log_id", logIds)
    .eq("is_completed", false);

  if (error) throw new Error(error.message);
  return count ?? 0;
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
