import type { Project, ProjectWithTasks, TaskWithDetails } from "@/types";
import {
  projects,
  tasks,
  getClientById,
  getUserById,
} from "@/lib/mockData";
import { delay } from "./helpers";

/** List all projects, optionally filtered by client. */
export async function getProjects(clientId?: string): Promise<Project[]> {
  let result = [...projects];
  if (clientId) result = result.filter((p) => p.client_id === clientId);
  return delay(result);
}

/** Full project detail with enriched task timeline. */
export async function getProjectDetail(
  projectId: string,
): Promise<ProjectWithTasks | null> {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return delay(null);

  const clientName = getClientById(project.client_id)?.name ?? "Unknown";

  const projectTasks: TaskWithDetails[] = tasks
    .filter((t) => t.project_id === projectId && t.is_completed)
    .sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""))
    .map((task) => ({
      task,
      clientName,
      projectName: project.name,
      completedByName: getUserById(task.completed_by ?? "")?.name ?? null,
    }));

  return delay({ project, clientName, tasks: projectTasks });
}
