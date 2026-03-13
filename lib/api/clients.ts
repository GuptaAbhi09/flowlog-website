import type { Client, ClientWithProjects, Task } from "@/types";
import {
  clients,
  clientMembers,
  projects,
  tasks,
  getUserById,
} from "@/lib/mockData";
import { delay } from "./helpers";

/** List all clients. */
export async function getClients(): Promise<Client[]> {
  return delay([...clients]);
}

/** Full client detail with projects, members, and completed activity. */
export async function getClientDetail(
  clientId: string,
): Promise<ClientWithProjects | null> {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return delay(null);

  const clientProjects = projects.filter((p) => p.client_id === clientId);

  const members = clientMembers
    .filter((m) => m.client_id === clientId)
    .map((m) => ({
      ...m,
      userName: getUserById(m.user_id)?.name ?? "Unknown",
    }));

  return delay({ client, projects: clientProjects, members });
}

/** Completed tasks for a client, grouped by date (most recent first). */
export async function getClientActivity(
  clientId: string,
): Promise<{ date: string; tasks: (Task & { userName: string })[] }[]> {
  const completed = tasks
    .filter((t) => t.client_id === clientId && t.is_completed)
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));

  const grouped = new Map<string, (Task & { userName: string })[]>();

  for (const task of completed) {
    const date = task.completed_at?.slice(0, 10) ?? "unknown";
    const userName = getUserById(task.completed_by ?? "")?.name ?? "Unknown";
    const entry = { ...task, userName };

    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(entry);
  }

  const result = Array.from(grouped.entries())
    .map(([date, tasks]) => ({ date, tasks }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return delay(result);
}
