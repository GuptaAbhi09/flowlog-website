import type { Meeting, CreateMeeting, UpdateMeeting } from "@/types";
import { meetings } from "@/lib/mockData";
import { delay, generateId } from "./helpers";

/** List all meetings, most recent first. */
export async function getMeetings(): Promise<Meeting[]> {
  const sorted = [...meetings].sort((a, b) =>
    b.meeting_date.localeCompare(a.meeting_date),
  );
  return delay(sorted);
}

/** Get a single meeting by ID. */
export async function getMeetingById(id: string): Promise<Meeting | null> {
  return delay(meetings.find((m) => m.id === id) ?? null);
}

/** Create a new meeting. */
export async function createMeeting(data: CreateMeeting): Promise<Meeting> {
  const meeting: Meeting = {
    ...data,
    id: generateId("meet"),
    created_at: new Date().toISOString(),
  };
  meetings.push(meeting);
  return delay(meeting);
}

/** Update an existing meeting. */
export async function updateMeeting(
  id: string,
  updates: UpdateMeeting,
): Promise<Meeting | null> {
  const idx = meetings.findIndex((m) => m.id === id);
  if (idx === -1) return delay(null);

  meetings[idx] = { ...meetings[idx], ...updates };
  return delay(meetings[idx]);
}
