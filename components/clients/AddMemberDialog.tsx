"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addClientMember, getProfiles } from "@/lib/api";
import type { User, UserRole } from "@/types";

interface AddMemberDialogProps {
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
  existingUserIds?: string[];
}

export function AddMemberDialog({
  clientId,
  open,
  onOpenChange,
  onAdded,
  existingUserIds = [],
}: AddMemberDialogProps) {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<UserRole>("collaborator");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setUserId("");
      setRole("collaborator");
      getProfiles().then(setProfiles);
    }
  }, [open]);

  const availableProfiles = profiles.filter((p) => !existingUserIds.includes(p.id));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!userId) {
      setError("Please select a user.");
      return;
    }
    setSubmitting(true);
    try {
      await addClientMember({ client_id: clientId, user_id: userId, role });
      onOpenChange(false);
      onAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add team member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="member-user" className="text-sm font-medium">
                User
              </label>
              <select
                id="member-user"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select user…</option>
                {availableProfiles.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label htmlFor="member-role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="member-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="owner">Owner</option>
                <option value="collaborator">Collaborator</option>
              </select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || availableProfiles.length === 0}>
              {submitting ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
