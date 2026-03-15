import { supabase } from "../supabaseClient";
import type { ClientInvite, CreateInvite } from "@/types/database";

/**
 * Creates a new invitation for a client or a specific project.
 */
export async function createInvite(input: CreateInvite): Promise<ClientInvite> {
  const { data, error } = await supabase
    .from("client_invites")
    .insert({
      client_id: input.client_id || null,
      project_id: input.project_id || null,
      email: input.email,
      token: input.token,
      invited_by: input.invited_by,
      role: input.role,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ClientInvite;
}

/**
 * Fetches an invite by its unique token using a secure RPC.
 * Used on the invitation acceptance page to get details safely.
 */
export async function getInviteByToken(token: string): Promise<{
  invite: ClientInvite;
  client_name: string | null;
  project_name: string | null;
} | null> {
  const { data, error } = await supabase.rpc("get_invite_details", {
    p_token: token,
  });

  if (error) throw new Error(error.message);
  return data as any;
}

/**
 * List all pending invites for a specific client.
 */
export async function getInvitesByClient(clientId: string): Promise<ClientInvite[]> {
  const { data, error } = await supabase
    .from("client_invites")
    .select("*")
    .eq("client_id", clientId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ClientInvite[];
}

/**
 * List all pending invites for a specific project.
 */
export async function getInvitesByProject(projectId: string): Promise<ClientInvite[]> {
  const { data, error } = await supabase
    .from("client_invites")
    .select("*")
    .eq("project_id", projectId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ClientInvite[];
}

/**
 * Accept an invite: 
 * 1. Mark invite as accepted
 * 2. Add user to client_members
 */
export async function acceptInvite(inviteId: string, userId: string): Promise<boolean> {
  // We use a transaction-like approach or just sequential calls.
  // In Supabase, if RLS allow, we can do both.
  
  // 1. Get invite details first to know client and role
  const { data: invite, error: fetchErr } = await supabase
    .from("client_invites")
    .select("*")
    .eq("id", inviteId)
    .single();

  if (fetchErr || !invite) throw new Error("Invite not found");

  // 2. Add to members FIRST while invite is still "pending" 
  // (Database RLS allows insertion if a matching pending invite exists)
  const { error: memberErr } = await supabase
    .from("client_members")
    .insert({
      client_id: invite.client_id,
      project_id: invite.project_id,
      user_id: userId,
      role: invite.role,
    });

  if (memberErr) {
    throw new Error(memberErr.message);
  }

  // 3. Mark the invite as accepted
  const { error: updateErr } = await supabase
    .from("client_invites")
    .update({ status: "accepted" })
    .eq("id", inviteId);

  if (updateErr) {
    throw new Error(updateErr.message);
  }

  return true;
}

/**
 * Decline an invite.
 */
export async function declineInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from("client_invites")
    .update({ status: "declined" })
    .eq("id", inviteId);

  if (error) throw new Error(error.message);
}

/**
 * Cancel/Delete an invite.
 */
export async function cancelInvite(inviteId: string): Promise<void> {
  const { error } = await supabase
    .from("client_invites")
    .delete()
    .eq("id", inviteId);

  if (error) throw new Error(error.message);
}
