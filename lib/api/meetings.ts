import type { Meeting, CreateMeeting, UpdateMeeting } from "@/types";
import { supabase } from "@/lib/supabaseClient";

/** List all meetings, most recent first. */
export async function getMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .order("meeting_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Meeting[];
}

/** Get a single meeting by ID. */
export async function getMeetingById(id: string): Promise<Meeting | null> {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return null;
  return data as Meeting | null;
}

/** Create a new meeting. */
export async function createMeeting(data: CreateMeeting): Promise<Meeting> {
  const { data: meeting, error } = await supabase
    .from("meetings")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return meeting as Meeting;
}

/** Update an existing meeting. */
export async function updateMeeting(
  id: string,
  updates: UpdateMeeting,
): Promise<Meeting | null> {
  const { data, error } = await supabase
    .from("meetings")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return null;
  return data as Meeting | null;
}
