"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, UserPlus } from "lucide-react";
import { getInviteByToken, acceptInvite, declineInvite, getSessionUser, logoutSupabase } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientInvite, User } from "@/types";

export default function AcceptInvitePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [invite, setInvite] = useState<ClientInvite | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    async function fetchData() {
      try {
        const [inviteData, userData] = await Promise.all([
          getInviteByToken(params.token),
          getSessionUser()
        ]);

        if (cancelled) return;

        if (!inviteData || !inviteData.invite) {
          setError("This invitation is invalid or has already been used.");
          setLoading(false);
          return;
        }

        setInvite(inviteData.invite);
        setClientName(inviteData.client_name);
        setProjectName(inviteData.project_name);
        setCurrentUser(userData);
        
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load invitation.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [params.token]);

  async function handleAccept() {
    if (!invite || !currentUser) {
      if (!currentUser) {
        // Redirect to login if not logged in
        router.push(`/login?redirectTo=/invite/${params.token}`);
      }
      return;
    }

    setProcessing(true);
    try {
      await acceptInvite(invite.id, currentUser.id);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept invitation.");
      setProcessing(false);
    }
  }

  async function handleDecline() {
    if (!invite) return;
    setProcessing(true);
    try {
      await declineInvite(invite.id);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline invitation.");
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success && invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md shadow-2xl border-green-500/20">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-center text-2xl font-bold">Successfully Joined!</CardTitle>
            <CardDescription className="text-center">
              You are now a member of <span className="font-bold text-foreground">{projectName || clientName}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-sm text-muted-foreground">
              You can now collaborate on tasks, projects, and more.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full h-11" 
              onClick={() => {
                if (invite.project_id) {
                  router.push(`/projects/${invite.project_id}`);
                } else if (invite.client_id) {
                  router.push(`/clients/${invite.client_id}`);
                } else {
                  router.push("/");
                }
              }}
            >
              Go to {projectName ? "Project" : "Dashboard"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/20 shadow-xl">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-center">Invitation Error</CardTitle>
            <CardDescription className="text-center">
              {error || "Something went wrong."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => router.push("/")}>
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isEmailMismatch = currentUser && currentUser.email.toLowerCase() !== invite.email.toLowerCase();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden">
        <div className="h-2 bg-primary" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">You&apos;re invited!</CardTitle>
          <CardDescription className="flex flex-col gap-1">
            <span>You have been invited to join:</span>
            <span className="font-bold text-foreground text-lg">
              {projectName || clientName}
            </span>
            <span className="text-xs">
              {projectName ? `(Project under ${clientName})` : "(Full Client Access)"}
            </span>
            <span className="mt-2">
              Role: <span className="capitalize font-medium text-primary">{invite.role}</span>
            </span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4 text-center">
          <div className="rounded-lg border bg-muted/20 p-4 space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Target Email</p>
            <p className="text-sm font-medium">{invite.email}</p>
          </div>

          {!currentUser ? (
            <div className="rounded-lg bg-blue-500/10 p-4 text-left flex gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-700">Login Required</p>
                <p className="text-xs text-blue-600/80">Please sign in with <span className="font-bold">{invite.email}</span> to accept this invitation.</p>
              </div>
            </div>
          ) : isEmailMismatch ? (
            <div className="rounded-lg bg-destructive/10 p-4 text-left flex gap-3">
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">Email Mismatch</p>
                <p className="text-xs text-destructive/80 leading-relaxed">
                  You are currently logged in as <span className="font-bold">{currentUser.email}</span>. 
                  This invitation is strictly for <span className="font-bold">{invite.email}</span>.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-green-500/10 p-4 text-left flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-700">Identity Verified</p>
                <p className="text-xs text-green-600/80">You are logged in as the intended recipient.</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 bg-muted/50 border-t p-6">
          <Button 
            className="w-full h-11" 
            size="lg" 
            onClick={handleAccept}
            disabled={processing || isEmailMismatch === true}
          >
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : !currentUser ? (
              "Sign in to Continue"
            ) : isEmailMismatch ? (
              "Account Mismatch"
            ) : (
              "Accept & Join Team"
            )}
          </Button>
          
          {isEmailMismatch && (
            <Button 
              variant="outline" 
              className="w-full text-xs"
              onClick={async () => {
                await logoutSupabase();
                // We clear store in handleLogout usually, but here we can just reload or redirect
                router.push(`/login?redirectTo=/invite/${params.token}`);
                router.refresh(); // Ensure session state is cleared
              }}
            >
              Sign out & Switch Account
            </Button>
          )}

          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground text-xs"
            onClick={handleDecline}
            disabled={processing}
          >
            Decline Invitation
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

