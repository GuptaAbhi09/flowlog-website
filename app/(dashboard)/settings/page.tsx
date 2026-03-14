"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useStore } from "@/store/useStore";
import {
  updateProfile,
  updatePassword,
  logoutSupabase,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const logout = useStore((s) => s.logout);
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.id, user?.name]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setNameError(null);
    setNameSuccess(false);
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Name is required.");
      return;
    }
    setNameSaving(true);
    try {
      const updated = await updateProfile(user.id, { name: trimmed });
      if (updated) {
        setUser(updated);
        setNameSuccess(true);
      } else {
        setNameError("Failed to update name.");
      }
    } catch {
      setNameError("Failed to update name.");
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setPasswordError(error);
      } else {
        setPasswordSuccess(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordError("Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutSupabase();
    logout();
    router.push("/");
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <p className="text-muted-foreground">Sign in to manage settings.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profile and account settings.
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your display name and email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="settings-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="settings-email"
              value={user.email}
              readOnly
              className="bg-muted"
            />
          </div>
          <form onSubmit={handleSaveName} className="grid gap-2">
            <label htmlFor="settings-name" className="text-sm font-medium">
              Display name
            </label>
            <div className="flex gap-2">
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Button type="submit" disabled={nameSaving}>
                {nameSaving ? "Saving…" : "Save"}
              </Button>
            </div>
            {nameError && (
              <p className="text-sm text-destructive">{nameError}</p>
            )}
            {nameSuccess && (
              <p className="text-sm text-green-600">Name updated.</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change password</CardTitle>
          <CardDescription>Set a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="settings-password" className="text-sm font-medium">
                New password
              </label>
              <Input
                id="settings-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="settings-confirm" className="text-sm font-medium">
                Confirm password
              </label>
              <Input
                id="settings-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-600">Password updated.</p>
            )}
            <Button type="submit" disabled={passwordSaving}>
              {passwordSaving ? "Updating…" : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="outline"
            className="gap-2 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
