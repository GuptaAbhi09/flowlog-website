"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";

/**
 * Wraps dashboard routes — redirects to login if no user is in the store.
 * Uses a mounted flag to avoid hydration mismatch (localStorage isn't
 * available during SSR).
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.user);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.replace("/");
    }
  }, [mounted, user, router]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
