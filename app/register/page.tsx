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
import { signUp } from "@/lib/api";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/daily");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(trimmedEmail, password, trimmedName || trimmedEmail);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      if ("needsConfirmation" in result) {
        setSuccessMessage("Check your email to confirm your account, then sign in.");
        return;
      }

      setUser(result.user);
      setIsRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 animate-in fade-in zoom-in-95 duration-300">
        <Card className="w-full max-w-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">All Set, {user?.name}!</CardTitle>
            <CardDescription>
              Your account has been created. Let's add a profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-8 py-6">
            <AvatarUpload />
            <div className="w-full space-y-3">
              <Button 
                variant="default" 
                className="w-full h-11" 
                onClick={() => router.push("/daily")}
              >
                Go to Daily Workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-auto items-center justify-center">
            <img src="/assets/flowlog.png" alt="FlowLog" className="h-12 w-auto object-contain" />
          </div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>
            Register for FlowLog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label htmlFor="register-name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="register-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="register-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="register-password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="register-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">At least 6 characters</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="register-confirm" className="text-sm font-medium">
                Confirm password
              </label>
              <Input
                id="register-confirm"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {successMessage && (
              <p className="text-sm text-green-600">{successMessage}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Register"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/" className="font-medium text-primary underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
