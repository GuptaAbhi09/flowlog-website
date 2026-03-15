"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { login } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/daily");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result) {
        setUser(result);
        router.push("/daily");
      } else {
        setError("Invalid email or password");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-2 shadow-xl animate-in fade-in zoom-in-95 duration-300">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto mb-4 flex h-20 w-auto items-center justify-center">
            <img src="/assets/flowlog.png" alt="FlowLog" className="h-16 w-auto object-contain" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-base">
            Sign in to continue your work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-muted-foreground ml-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-sm font-semibold text-muted-foreground">
                  Password
                </label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium border border-destructive/20 animate-in shake-in duration-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-bold shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">New to FlowLog?</span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-11 font-semibold" asChild>
              <Link href="/register">Create an account</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
