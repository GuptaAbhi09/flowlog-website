import type { TimelineEntry, TimelineFilters } from "@/types";
import { tasks, getClientById, getProjectById, getUserById } from "@/lib/mockData";
import { delay } from "./helpers";

/**
 * Global timeline of completed work.
 * All views (client activity, project timeline, EOD) derive from
 * the same task data — this is just a filtered, enriched projection.
 */
export async function getTimeline(
  filters: TimelineFilters,
): Promise<TimelineEntry[]> {
  let completed = tasks.filter((t) => t.is_completed && t.completed_at);

  if (filters.clientId) {
    completed = completed.filter((t) => t.client_id === filters.clientId);
  }
  if (filters.projectId) {
    completed = completed.filter((t) => t.project_id === filters.projectId);
  }
  if (filters.dateFrom) {
    completed = completed.filter(
      (t) => (t.completed_at ?? "") >= filters.dateFrom!,
    );
  }
  if (filters.dateTo) {
    const to = filters.dateTo + "T23:59:59.999Z";
    completed = completed.filter((t) => (t.completed_at ?? "") <= to);
  }

  const entries: TimelineEntry[] = completed
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""))
    .map((task) => ({
      task,
      clientName: task.client_id
        ? getClientById(task.client_id)?.name ?? null
        : null,
      projectName: task.project_id
        ? getProjectById(task.project_id)?.name ?? null
        : null,
      completedByName:
        getUserById(task.completed_by ?? "")?.name ?? "Unknown",
      date: task.completed_at?.slice(0, 10) ?? "",
    }));

  return delay(entries);
}
