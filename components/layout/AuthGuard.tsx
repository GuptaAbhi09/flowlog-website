"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { supabase } from "@/lib/supabaseClient";
import { getCurrentUser } from "@/lib/api";

/**
 * Wraps dashboard routes — redirects to login if no user.
 * On mount: if Supabase has a session but store has no user, fetches profile
 * and sets user (so refresh keeps you logged in).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Restore user from Supabase session if store is empty
  useEffect(() => {
    if (!mounted) return;

    const restore = async () => {
      if (user) {
        setChecking(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (sessionUser) {
        const appUser = await getCurrentUser(sessionUser.id);
        if (appUser) setUser(appUser);
      }
      setChecking(false);
    };

    restore();
  }, [mounted, user, setUser]);

  useEffect(() => {
    if (!checking && mounted && !user) {
      router.replace("/");
    }
  }, [checking, mounted, user, router]);

  if (!mounted || checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
