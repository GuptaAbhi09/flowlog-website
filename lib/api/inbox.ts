import type { InboxItem, CreateInboxItem, UpdateInboxItem } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { createTaskFromInput } from "./tasks";
import { getOrCreateTodayLog } from "./dayLogs";

/** List inbox items. Pass `unprocessedOnly` to filter. */
export async function getInboxItems(
  userId: string,
  unprocessedOnly = false,
): Promise<InboxItem[]> {
  let query = supabase
    .from("inbox_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (unprocessedOnly) query = query.eq("is_processed", false);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as InboxItem[];
}

/** Count of unprocessed inbox items. */
export async function getUnprocessedCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("inbox_items")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_processed", false);

  if (error) return 0;
  return count ?? 0;
}

/** Create a new inbox item (quick capture). */
export async function createInboxItem(
  data: CreateInboxItem,
): Promise<InboxItem> {
  const { data: item, error } = await supabase
    .from("inbox_items")
    .insert({ ...data, is_processed: false })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return item as InboxItem;
}

/** Update an inbox item. */
export async function updateInboxItem(
  id: string,
  updates: UpdateInboxItem,
): Promise<InboxItem | null> {
  const { data, error } = await supabase
    .from("inbox_items")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return null;
  return data as InboxItem | null;
}

/** Delete an inbox item. */
export async function deleteInboxItem(id: string): Promise<boolean> {
  const { error } = await supabase.from("inbox_items").delete().eq("id", id);
  return !error;
}

/**
 * Convert an inbox item into a task in today's day log.
 * Marks the inbox item as processed.
 */
export async function convertInboxToTask(
  inboxId: string,
  userId: string,
): Promise<{ success: boolean }> {
  const { data: item, error: fetchErr } = await supabase
    .from("inbox_items")
    .select("*")
    .eq("id", inboxId)
    .maybeSingle();

  if (fetchErr || !item) return { success: false };

  const todayLog = await getOrCreateTodayLog(userId);
  await createTaskFromInput(
    (item as InboxItem).content,
    userId,
    todayLog.id,
    "inbox",
  );

  await supabase
    .from("inbox_items")
    .update({ is_processed: true })
    .eq("id", inboxId);

  return { success: true };
}
