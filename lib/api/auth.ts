import type { User } from "@/types";
import { supabase } from "@/lib/supabaseClient";

/** Map Supabase profile row to app User type */
function profileToUser(row: {
  id: string;
  email: string;
  name: string;
  created_at: string;
}): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    created_at: row.created_at,
  };
}

/**
 * Sign up (register) with email, password, and name.
 * Creates auth user, then creates profile row. Returns User if session is active
 * (e.g. email confirmation disabled), or { needsConfirmation: true } if user
 * must confirm email first.
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<{ user: User } | { needsConfirmation: true } | { error: string }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name.trim() || email } },
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Sign up failed." };

  if (data.session) {
    const displayName = (name.trim() || (data.user.email ?? email)).slice(0, 255);
    const now = new Date().toISOString();
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email: data.user.email ?? email,
        name: displayName,
        created_at: now,
      },
      { onConflict: "id" },
    );
    if (profileError) {
      return { error: "Account created but profile could not be saved. Try signing in." };
    }
    const profile = await supabase
      .from("profiles")
      .select("id, email, name, created_at")
      .eq("id", data.user.id)
      .single();
    if (profile.data) return { user: profileToUser(profile.data) };
  }

  return { needsConfirmation: true };
}

/**
 * Sign in with email + password via Supabase Auth.
 * Fetches profile from public.profiles and returns User, or null on failure.
 */
export async function login(
  email: string,
  password: string,
): Promise<User | null> {
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) return null;

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, name, created_at")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    const name = authData.user.user_metadata?.name ?? authData.user.email ?? "";
    await supabase.from("profiles").upsert(
      {
        id: authData.user.id,
        email: authData.user.email ?? "",
        name: name.slice(0, 255),
        created_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    const retry = await supabase
      .from("profiles")
      .select("id, email, name, created_at")
      .eq("id", authData.user.id)
      .single();
    if (retry.data) return profileToUser(retry.data);
    return null;
  }

  return profileToUser(profile);
}

/**
 * Get the currently authenticated user's profile.
 */
export async function getSessionUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getCurrentUser(user.id);
}

/**
 * Get app user by id from profiles table.
 */
export async function getCurrentUser(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, created_at")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return profileToUser(data);
}

/**
 * List all profiles (for Add member dropdown etc).
 */
export async function getProfiles(): Promise<User[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, created_at")
    .order("name");
  if (error) return [];
  return (data ?? []).map(profileToUser);
}

/**
 * Update profile (e.g. display name). Caller must be the user or have permission.
 */
export async function updateProfile(
  userId: string,
  updates: { name?: string },
): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("id, email, name, created_at")
    .single();

  if (error || !data) return null;
  return profileToUser(data);
}

/**
 * Update current user's password. Requires the user to be signed in.
 */
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error: error?.message ?? null };
}

/**
 * Sign out from Supabase (clears session). Call before clearing Zustand store.
 */
export async function logoutSupabase(): Promise<void> {
  await supabase.auth.signOut();
}
