import { supabase } from "../supabaseClient";
import type { ClientInvite, CreateInvite } from "@/types/database";

/**
 * Creates a new invitation for a client.
 */
export async function createInvite(input: CreateInvite): Promise<ClientInvite> {
  const { data, error } = await supabase
    .from("client_invites")
    .insert({
      ...input,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as ClientInvite;
}

/**
 * Fetches an invite by its unique token.
 * Used on the invitation acceptance page.
 */
export async function getInviteByToken(token: string): Promise<ClientInvite | null> {
  const { data, error } = await supabase
    .from("client_invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ClientInvite | null;
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

  // 2. Update status
  const { error: updateErr } = await supabase
    .from("client_invites")
    .update({ status: "accepted" })
    .eq("id", inviteId);

  if (updateErr) throw new Error(updateErr.message);

  // 3. Add to members
  const { error: memberErr } = await supabase
    .from("client_members")
    .insert({
      client_id: invite.client_id,
      user_id: userId,
      role: invite.role,
    });

  if (memberErr) {
    // Rollback status if failed (primitive rollback)
    await supabase.from("client_invites").update({ status: "pending" }).eq("id", inviteId);
    throw new Error(memberErr.message);
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
