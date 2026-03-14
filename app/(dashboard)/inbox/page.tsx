"use client";

import { useEffect, useState, useCallback } from "react";
import { Inbox as InboxIcon } from "lucide-react";
import type { InboxItem } from "@/types";
import {
  getInboxItems,
  createInboxItem,
  updateInboxItem,
  deleteInboxItem,
  convertInboxToTask,
  getUnprocessedCount,
} from "@/lib/api";
import { useStore } from "@/store/useStore";
import { InboxInput } from "@/components/inbox/InboxInput";
import { InboxList } from "@/components/inbox/InboxList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InboxPage() {
  const user = useStore((s) => s.user);
  const setUnprocessedInboxCount = useStore(
    (s) => s.setUnprocessedInboxCount,
  );

  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCounts = useCallback(async () => {
    if (!user) return;
    const count = await getUnprocessedCount(user.id);
    setUnprocessedInboxCount(count);
  }, [user, setUnprocessedInboxCount]);

  const loadItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await getInboxItems(user.id);
      setItems(result);
      await refreshCounts();
    } finally {
      setLoading(false);
    }
  }, [user, refreshCounts]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAdd = async (content: string) => {
    if (!user) return;
    await createInboxItem({ content, user_id: user.id });
    await loadItems();
  };

  const handleConvert = async (id: string) => {
    if (!user) return;
    await convertInboxToTask(id, user.id);
    await loadItems();
  };

  const handleDelete = async (id: string) => {
    await deleteInboxItem(id);
    await loadItems();
  };

  const handleEdit = async (id: string, content: string) => {
    await updateInboxItem(id, { content });
    await loadItems();
  };

  const handleMarkProcessed = async (id: string) => {
    await updateInboxItem(id, { is_processed: true });
    await loadItems();
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inbox</h1>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <InboxIcon className="h-4 w-4" />
          Capture first, organize later. Convert items into tasks when ready.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Capture</CardTitle>
        </CardHeader>
        <CardContent>
          <InboxInput onSubmit={handleAdd} disabled={!user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Inbox Items</CardTitle>
        </CardHeader>
        <CardContent>
          <InboxList
            items={items}
            onConvert={handleConvert}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onMarkProcessed={handleMarkProcessed}
          />
        </CardContent>
      </Card>
    </div>
  );
}

