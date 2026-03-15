import type { Client, ClientWithProjects, CreateClient, CreateClientMember, Task } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser } from "./auth";

/** Create a new client. */
export async function createClient(data: CreateClient): Promise<Client> {
  const { data: row, error } = await supabase
    .from("clients")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as Client;
}

/** Update a client (e.g. name). */
export async function updateClient(
  id: string,
  updates: Partial<Pick<Client, "name">>,
): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return null;
  return data as Client | null;
}

/** Add a member to a client (owner or collaborator). */
export async function addClientMember(
  data: CreateClientMember,
): Promise<{ id: string }> {
  const { data: row, error } = await supabase
    .from("client_members")
    .insert(data)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: (row as { id: string }).id };
}

/** Remove a member from a client. */
export async function removeClientMember(memberId: string): Promise<boolean> {
  const { error } = await supabase
    .from("client_members")
    .delete()
    .eq("id", memberId);
  return !error;
}

/** List all clients. */
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

/** Get a single client by ID (for display names). */
export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (error) return null;
  return data as Client | null;
}

/** Get client by name (case-insensitive, for task parser). */
export async function getClientByName(name: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .ilike("name", name)
    .limit(1);
  if (error || !data?.length) return null;
  return data[0] as Client;
}

/** Full client detail with projects, members, and completed activity. */
export async function getClientDetail(
  clientId: string,
): Promise<ClientWithProjects | null> {
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();

  if (clientError || !client) return null;

  const { data: clientProjects, error: projError } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId);

  if (projError) throw new Error(projError.message);

  const [membersRowsRes, invitesRowsRes] = await Promise.all([
    supabase
      .from("client_members")
      .select("*, profiles:user_id(name, avatar_url)")
      .eq("client_id", clientId),
    supabase
      .from("client_invites")
      .select("*")
      .eq("client_id", clientId)
      .eq("status", "pending")
  ]);

  if (membersRowsRes.error) throw new Error(membersRowsRes.error.message);

  const members = (membersRowsRes.data ?? []).map((m: {
    profiles?: { name: string; avatar_url: string | null } | null;
  }) => ({
    ...m,
    userName: m.profiles?.name ?? "Unknown",
    userAvatar: m.profiles?.avatar_url ?? null
  })) as (import("@/types").ClientMember & { userName: string; userAvatar: string | null })[];

  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  // If the owner isn't in members yet, add them for display
  if (client.created_by && !members.find(m => m.user_id === client.created_by)) {
    const creator = await getCurrentUser(client.created_by);
    if (creator) {
      members.unshift({
        id: "owner-ref",
        client_id: client.id,
        project_id: null,
        user_id: client.created_by,
        role: "owner",
        added_at: client.created_at,
        userName: creator.name,
        userAvatar: creator.avatar_url
      });
    }
  }

  let currentRole = membersRowsRes.data?.find(m => m.user_id === authUser?.id)?.role ?? null;
  
  // If the user created the client, they are an owner even if not explicitly in client_members
  if (!currentRole && client.created_by === authUser?.id) {
    currentRole = "owner";
  }

  return {
    client: client as Client,
    projects: (clientProjects ?? []) as ClientWithProjects["projects"],
    members,
    invites: (invitesRowsRes.data ?? []) as import("@/types").ClientInvite[],
    currentRole,
  };
}

/** Completed tasks for a client, grouped by date (most recent first). Optimized with joins. */
export async function getClientActivity(
  clientId: string,
): Promise<{ date: string; tasks: (Task & { userName: string })[] }[]> {
  const { data: completed, error } = await supabase
    .from("tasks")
    .select("*, profiles!completed_by(name, avatar_url)")
    .eq("client_id", clientId)
    .eq("is_completed", true)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);

  const grouped = new Map<string, (Task & { userName: string })[]>();

  for (const task of (completed ?? []) as (Task & {
    profiles?: { name: string; avatar_url: string | null } | null;
  })[]) {
    const date = task.completed_at?.slice(0, 10) ?? "unknown";
    const userName = task.profiles?.name ?? "Unknown";
    const userAvatar = task.profiles?.avatar_url ?? null;
    const entry = { ...task, userName, userAvatar };
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(entry);
  }

  return Array.from(grouped.entries())
    .map(([date, tasks]) => ({ date, tasks }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Delete a client and all its associated data. */
export async function deleteClient(clientId: string): Promise<boolean> {
  const { error } = await supabase
    .from("clients")
    .delete()
    .eq("id", clientId);
  return !error;
}
