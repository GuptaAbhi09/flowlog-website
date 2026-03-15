import type { Project, ProjectWithTasks, CreateProject, TaskWithDetails, UpdateProject } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser } from "./auth";
import { getClientDetail } from "./clients";

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

/** List projects, optionally filtered by client OR only personal projects. */
export async function getProjects(options?: { clientId?: string; onlyPersonal?: boolean }): Promise<Project[]> {
  let query = supabase.from("projects").select("*").order("created_at", { ascending: false });
  
  if (options?.clientId) {
    query = query.eq("client_id", options.clientId);
  } else if (options?.onlyPersonal) {
    query = query.is("client_id", null);
  }

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

  let clientInfo: any = undefined;
  let clientName = "Personal Project";

  if (project.client_id) {
    clientInfo = await getClientDetail(project.client_id);
    clientName = clientInfo?.client.name ?? "Unknown Client";
  } else {
    // Fetch project-specific members and invites if no client
    const [membersRowsRes, invitesRowsRes] = await Promise.all([
      supabase
        .from("client_members")
        .select("*, profiles:user_id(name, avatar_url)")
        .eq("project_id", projectId),
      supabase
        .from("client_invites")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", "pending")
    ]);

    const members = (membersRowsRes.data ?? []).map((m: any) => ({
      ...m,
      userName: m.profiles?.name ?? "Unknown",
      userAvatar: m.profiles?.avatar_url ?? null
    }));
    const invites = invitesRowsRes.data || [];

    const { data: { user: authUser } } = await supabase.auth.getUser();

    // Ensure project owner is in the members list for personal projects
    if (project.user_id && !members.find(m => m.user_id === project.user_id)) {
      const ownerUser = await getCurrentUser(project.user_id);
      if (ownerUser) {
        members.unshift({
          id: "owner-ref",
          client_id: null,
          project_id: project.id,
          user_id: project.user_id,
          role: "owner",
          added_at: project.created_at,
          userName: ownerUser.name,
          userAvatar: ownerUser.avatar_url
        });
      }
    }
    let currentRole = membersRowsRes.data?.find(m => m.user_id === authUser?.id)?.role ?? null;
    
    if (!currentRole && project.user_id === authUser?.id) {
      currentRole = "owner";
    }

    clientInfo = {
      client: { id: "personal", name: "Personal" },
      projects: [],
      members,
      invites,
      currentRole
    };
  }

  const { data: completedRows, error: compErr } = await supabase
    .from("tasks")
    .select("*, profiles!completed_by(name, avatar_url)")
    .eq("project_id", projectId)
    .eq("is_completed", true)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (compErr) throw new Error(compErr.message);

  const { data: pendingRows, error: pendErr } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_completed", false)
    .order("created_at", { ascending: false });

  if (pendErr) throw new Error(pendErr.message);

  const completedTasks: TaskWithDetails[] = (completedRows ?? []).map((task: any) => ({
    task: task as TaskWithDetails["task"],
    clientName,
    projectName: project.name,
    completedByName: task.profiles?.name ?? null,
    completedByAvatar: task.profiles?.avatar_url ?? null,
  }));

  return {
    project: project as Project,
    clientName,
    tasks: completedTasks,
    pendingTasks: (pendingRows ?? []) as import("@/types/database").Task[],
    clientInfo
  };
}

/** Delete a project and all its associated tasks. */
export async function deleteProject(projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);
  return !error;
}
