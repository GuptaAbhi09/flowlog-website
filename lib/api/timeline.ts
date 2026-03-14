import type { TimelineEntry, TimelineFilters } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { getClientById } from "./clients";
import { getProjectById } from "./projects";
import { getCurrentUser } from "./auth";

/**
 * Global timeline of completed work.
 * All views derive from the same task data — filtered, enriched projection.
 */
export async function getTimeline(
  filters: TimelineFilters,
): Promise<TimelineEntry[]> {
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("is_completed", true)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (filters.clientId) query = query.eq("client_id", filters.clientId);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.dateFrom)
    query = query.gte("completed_at", filters.dateFrom);
  if (filters.dateTo)
    query = query.lte("completed_at", `${filters.dateTo}T23:59:59.999Z`);

  const { data: tasks, error } = await query;

  if (error) throw new Error(error.message);
  const list = (tasks ?? []) as TimelineEntry["task"][];

  const entries: TimelineEntry[] = await Promise.all(
    list.map(async (task) => {
      const clientName = task.client_id
        ? (await getClientById(task.client_id))?.name ?? null
        : null;
      const projectName = task.project_id
        ? (await getProjectById(task.project_id))?.name ?? null
        : null;
      const u = await getCurrentUser(task.completed_by ?? "");
      const completedByName = u?.name ?? "Unknown";
      return {
        task,
        clientName,
        projectName,
        completedByName,
        date: task.completed_at?.slice(0, 10) ?? "",
      };
    }),
  );

  return entries;
}
