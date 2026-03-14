import type { Project, ProjectWithTasks, CreateProject, TaskWithDetails, UpdateProject } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser } from "./auth";

/** Create a new project under a client. */
export async function createProject(data: CreateProject): Promise<Project> {
  const { data: row, error } = await supabase
    .from("projects")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as Project;
}

/** Update a project (name, status). */
export async function updateProject(
  id: string,
  updates: UpdateProject,
): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return null;
  return data as Project | null;
}

/** List all projects, optionally filtered by client. */
export async function getProjects(clientId?: string): Promise<Project[]> {
  let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (clientId) query = query.eq("client_id", clientId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Project[];
}

/** Get a single project by ID (for display names). */
export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return data as Project | null;
}

/** Get project by name (case-insensitive, for task parser). */
export async function getProjectByName(name: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .ilike("name", name)
    .limit(1);
  if (error || !data?.length) return null;
  return data[0] as Project;
}

/** Full project detail with enriched task timeline. */
export async function getProjectDetail(
  projectId: string,
): Promise<ProjectWithTasks | null> {
  const { data: project, error: projError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projError || !project) return null;

  const { data: clientRow } = await supabase
    .from("clients")
    .select("name")
    .eq("id", project.client_id)
    .maybeSingle();
  const clientName = (clientRow as { name?: string } | null)?.name ?? "Unknown";

  const { data: taskRows, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_completed", true)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (taskError) throw new Error(taskError.message);

  const projectTasks: TaskWithDetails[] = await Promise.all(
    (taskRows ?? []).map(async (task) => {
      const u = await getCurrentUser(task.completed_by ?? "");
      return {
        task: task as TaskWithDetails["task"],
        clientName,
        projectName: project.name,
        completedByName: u?.name ?? null,
      };
    }),
  );

  return {
    project: project as Project,
    clientName,
    tasks: projectTasks,
  };
}
