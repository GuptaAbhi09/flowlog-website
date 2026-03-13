import type { InboxItem, CreateInboxItem, UpdateInboxItem } from "@/types";
import { inboxItems } from "@/lib/mockData";
import { delay, generateId } from "./helpers";
import { createTaskFromInput } from "./tasks";
import { getOrCreateTodayLog } from "./dayLogs";

/** List inbox items. Pass `unprocessedOnly` to filter. */
export async function getInboxItems(
  userId: string,
  unprocessedOnly = false,
): Promise<InboxItem[]> {
  let result = inboxItems.filter((i) => i.user_id === userId);
  if (unprocessedOnly) result = result.filter((i) => !i.is_processed);
  return delay(result.sort((a, b) => b.created_at.localeCompare(a.created_at)));
}

/** Count of unprocessed inbox items. */
export async function getUnprocessedCount(userId: string): Promise<number> {
  return delay(
    inboxItems.filter((i) => i.user_id === userId && !i.is_processed).length,
  );
}

/** Create a new inbox item (quick capture). */
export async function createInboxItem(
  data: CreateInboxItem,
): Promise<InboxItem> {
  const item: InboxItem = {
    ...data,
    id: generateId("inbox"),
    is_processed: false,
    created_at: new Date().toISOString(),
  };
  inboxItems.push(item);
  return delay(item);
}

/** Update an inbox item. */
export async function updateInboxItem(
  id: string,
  updates: UpdateInboxItem,
): Promise<InboxItem | null> {
  const idx = inboxItems.findIndex((i) => i.id === id);
  if (idx === -1) return delay(null);

  inboxItems[idx] = { ...inboxItems[idx], ...updates };
  return delay(inboxItems[idx]);
}

/** Delete an inbox item. */
export async function deleteInboxItem(id: string): Promise<boolean> {
  const idx = inboxItems.findIndex((i) => i.id === id);
  if (idx === -1) return delay(false);
  inboxItems.splice(idx, 1);
  return delay(true);
}

/**
 * Convert an inbox item into a task in today's day log.
 * Marks the inbox item as processed.
 */
export async function convertInboxToTask(
  inboxId: string,
  userId: string,
): Promise<{ success: boolean }> {
  const item = inboxItems.find((i) => i.id === inboxId);
  if (!item) return delay({ success: false });

  const todayLog = await getOrCreateTodayLog(userId);
  await createTaskFromInput(item.content, userId, todayLog.id, "inbox");

  const idx = inboxItems.findIndex((i) => i.id === inboxId);
  if (idx !== -1) {
    inboxItems[idx] = { ...inboxItems[idx], is_processed: true };
  }

  return delay({ success: true });
}
