import type { ClientUpdate, CreateClientUpdate } from "@/types";
import { supabase } from "@/lib/supabaseClient";

/** Add a new client update record. */
export async function createClientUpdate(data: CreateClientUpdate): Promise<ClientUpdate> {
  const { data: row, error } = await supabase
    .from("client_updates")
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as ClientUpdate;
}

/** Get all client updates for the current user. */
export async function getClientUpdates(): Promise<ClientUpdate[]> {
  const { data, error } = await supabase
    .from("client_updates")
    .select("*")
    .order("position", { ascending: true }); // New order
  if (error) throw new Error(error.message);
  return (data ?? []) as ClientUpdate[];
}

/** Reorder multiple client updates by updating their positions. */
export async function reorderClientUpdates(updates: { id: string, position: number }[]): Promise<boolean> {
  const { error } = await supabase
    .from("client_updates")
    .upsert(updates, { onConflict: "id" });
  return !error;
}

/** Update a client update record. */
export async function updateClientUpdate(
  id: string,
  updates: Partial<Pick<ClientUpdate, "client_name" | "last_update" | "next_steps">>,
): Promise<ClientUpdate | null> {
  const { data, error } = await supabase
    .from("client_updates")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) return null;
  return data as ClientUpdate | null;
}

/** Delete a client update record. */
export async function deleteClientUpdate(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("client_updates")
    .delete()
    .eq("id", id);
  return !error;
}
