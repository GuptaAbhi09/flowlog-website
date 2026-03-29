import type { DayLog } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { todayDateStr } from "./helpers";

/** Get the day log for a specific date, or null if none exists. */
export async function getDayLogByDate(
  userId: string,
  date: string,
): Promise<DayLog | null> {
  const { data, error } = await supabase
    .from("day_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error || !data) return null;
  return data as DayLog;
}

/**
 * Get today's day log for a user — creates one automatically if it
 * doesn't exist yet (the "auto day log" requirement).
 */
export async function getOrCreateTodayLog(userId: string): Promise<DayLog> {
  const today = todayDateStr();
  const existing = await getDayLogByDate(userId, today);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("day_logs")
    .insert({ user_id: userId, date: today })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const concurrentExisting = await getDayLogByDate(userId, today);
      if (concurrentExisting) return concurrentExisting;
    }
    throw new Error(error.message);
  }



  return data as DayLog;
}

/**
 * Returns day log history for a user, most recent first.
 * Optionally limited to `count` entries.
 */
export async function getDayLogHistory(
  userId: string,
  count?: number,
): Promise<DayLog[]> {
  let query = supabase
    .from("day_logs")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (count != null) query = query.limit(count);
  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return (data ?? []) as DayLog[];
}

/**
 * Create a day log for an arbitrary date (if it doesn't already exist).
 */
export async function createDayLogForDate(
  userId: string,
  date: string,
): Promise<DayLog> {
  const existing = await getDayLogByDate(userId, date);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("day_logs")
    .insert({ user_id: userId, date })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const concurrentExisting = await getDayLogByDate(userId, date);
      if (concurrentExisting) return concurrentExisting;
    }
    throw new Error(error.message);
  }
  return data as DayLog;
}
