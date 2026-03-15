"use client";

import { useState } from "react";
import { Mail, Loader2, Send, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvite, getSessionUser } from "@/lib/api";
import type { UserRole } from "@/types";

interface InviteMemberDialogProps {
  clientId?: string;
  projectId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited?: () => void;
}

export function InviteMemberDialog({
  clientId,
  projectId,
  open,
  onOpenChange,
  onInvited,
}: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("collaborator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  const [copied, setCopied] = useState(false);

  async function handleInvite() {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(false);
    setCopied(false);

    try {
      const user = await getSessionUser();
      if (!user) throw new Error("Not logged in");

      const token = Math.random().toString(36).substring(2, 10) + 
                    Math.random().toString(36).substring(2, 10);

      await createInvite({
        client_id: clientId || null,
        project_id: projectId || null,
        email: email.trim(),
        role,
        token,
        invited_by: user.id,
      });

      const baseUrl = window.location.origin;
      const fullLink = `${baseUrl}/invite/${token}`;
      setInviteLink(fullLink);
      setSuccess(true);
      setEmail("");
      onInvited?.();
    } catch (err: any) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) {
        setSuccess(false);
        setInviteLink("");
        setCopied(false);
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Teammate</DialogTitle>
          <DialogDescription>
            Generate an invitation link to share with your colleague.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4 rounded-lg bg-green-500/5 p-4 border border-green-500/20">
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Invitation Generated!
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this link and send it to your teammate:
              </p>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={inviteLink} 
                  className="bg-muted text-xs font-mono select-all"
                />
                <Button 
                  size="sm" 
                  variant={copied ? "default" : "outline"}
                  className={copied ? "bg-green-600 hover:bg-green-700 text-white transition-all" : ""}
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Copied!
                    </>
                  ) : "Copy"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={role}
                  onValueChange={(v) => setRole(v as UserRole)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collaborator">Collaborator</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {success ? "Close" : "Cancel"}
          </Button>
          {!success && (
            <Button onClick={handleInvite} disabled={loading || !email}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate Link
                </>
              )}
            </Button>
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}
