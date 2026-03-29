import type { Task, CreateTask, UpdateTask } from "@/types";
import { supabase } from "@/lib/supabaseClient";
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
  const result = await intelligentParse(rawInput);
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
