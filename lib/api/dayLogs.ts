import type { DayLog } from "@/types";
import { dayLogs } from "@/lib/mockData";
import { delay, generateId, todayDateStr } from "./helpers";

/** Get the day log for a specific date, or null if none exists. */
export async function getDayLogByDate(
  userId: string,
  date: string,
): Promise<DayLog | null> {
  const log = dayLogs.find((d) => d.user_id === userId && d.date === date);
  return delay(log ?? null);
}

/**
 * Get today's day log for a user — creates one automatically if it
 * doesn't exist yet (the "auto day log" requirement).
 */
export async function getOrCreateTodayLog(userId: string): Promise<DayLog> {
  const today = todayDateStr();
  let log = dayLogs.find((d) => d.user_id === userId && d.date === today);

  if (!log) {
    log = {
      id: generateId("dl"),
      user_id: userId,
      date: today,
      created_at: new Date().toISOString(),
    };
    dayLogs.push(log);
  }

  return delay(log);
}

/**
 * Returns day log history for a user, most recent first.
 * Optionally limited to `count` entries.
 */
export async function getDayLogHistory(
  userId: string,
  count?: number,
): Promise<DayLog[]> {
  const logs = dayLogs
    .filter((d) => d.user_id === userId)
    .sort((a, b) => b.date.localeCompare(a.date));

  return delay(count ? logs.slice(0, count) : logs);
}

/**
 * Create a day log for an arbitrary date (if it doesn't already exist).
 * Useful for jumping to any date from the calendar.
 */
export async function createDayLogForDate(
  userId: string,
  date: string,
): Promise<DayLog> {
  const existing = dayLogs.find((d) => d.user_id === userId && d.date === date);
  if (existing) return delay(existing);

  const log: DayLog = {
    id: generateId("dl"),
    user_id: userId,
    date,
    created_at: new Date().toISOString(),
  };
  dayLogs.push(log);
  return delay(log);
}

