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

  const { data: membersRows, error: memError } = await supabase
    .from("client_members")
    .select("*")
    .eq("client_id", clientId);

  if (memError) throw new Error(memError.message);

  const members = await Promise.all(
    (membersRows ?? []).map(async (m) => {
      const u = await getCurrentUser(m.user_id);
      return { ...m, userName: u?.name ?? "Unknown" };
    }),
  );

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const currentRole = membersRows?.find(m => m.user_id === authUser?.id)?.role ?? null;

  return {
    client: client as Client,
    projects: (clientProjects ?? []) as ClientWithProjects["projects"],
    members,
    currentRole,
  };
}

/** Completed tasks for a client, grouped by date (most recent first). */
export async function getClientActivity(
  clientId: string,
): Promise<{ date: string; tasks: (Task & { userName: string })[] }[]> {
  const { data: completed, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_completed", true)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);
  const tasksList = (completed ?? []) as Task[];

  const grouped = new Map<string, (Task & { userName: string })[]>();

  for (const task of tasksList) {
    const date = task.completed_at?.slice(0, 10) ?? "unknown";
    const u = await getCurrentUser(task.completed_by ?? "");
    const userName = u?.name ?? "Unknown";
    const entry = { ...task, userName };
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(entry);
  }

  return Array.from(grouped.entries())
    .map(([date, tasks]) => ({ date, tasks }))
    .sort((a, b) => b.date.localeCompare(a.date));
}
