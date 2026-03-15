import type { TimelineEntry, TimelineFilters } from "@/types";
import { supabase } from "@/lib/supabaseClient";

/**
 * Global timeline of completed work.
 * All views derive from the same task data — filtered, enriched projection.
 */
export async function getTimeline(
  filters: TimelineFilters,
): Promise<TimelineEntry[]> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return [];

  let query = supabase
    .from("tasks")
    .select("*, clients(name), projects(name), profiles!completed_by(name)")
    .eq("user_id", authUser.id)
    .eq("is_completed", true)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (filters.clientId) query = query.eq("client_id", filters.clientId);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  if (filters.dateFrom)
    query = query.gte("completed_at", filters.dateFrom);
  if (filters.dateTo)
    query = query.lte("completed_at", `${filters.dateTo}T23:59:59.999Z`);

  const { data: results, error } = await query;

  if (error) throw new Error(error.message);

  return (results ?? []).map((t: {
    clients?: { name: string } | null;
    projects?: { name: string } | null;
    profiles?: { name: string } | null;
    completed_at: string | null;
  }) => ({
    task: t as unknown as import("@/types/database").Task,
    clientName: t.clients?.name ?? null,
    projectName: t.projects?.name ?? null,
    completedByName: t.profiles?.name ?? "Unknown",
    date: t.completed_at?.slice(0, 10) ?? "",
  })) as TimelineEntry[];
}
