const API_DELAY_MS = 100;

/** Simulates network latency so UI code already handles async loading. */
export function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), API_DELAY_MS));
}

let _counter = 1000;

/** Generates a unique string ID (will be replaced by Supabase UUIDs). */
export function generateId(prefix: string): string {
  return `${prefix}-${++_counter}`;
}

/** Returns today as YYYY-MM-DD. */
export function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}
