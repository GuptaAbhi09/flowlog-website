// ---------------------------------------------------------------------------
// Work OS – Core Data Model
// ---------------------------------------------------------------------------
// These types mirror the future Supabase schema. Every entity uses `string`
// for IDs so we can switch to UUIDs without touching consumer code.
// ---------------------------------------------------------------------------

// ---- Enums / Literal Unions ------------------------------------------------

export type UserRole = "owner" | "collaborator";

export type ProjectStatus = "planned" | "in_progress" | "completed" | "blocked";

export type TaskPriority = "high" | "medium" | "low";

export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";

export type TaskSource = "sod" | "meeting" | "inbox";

// ---- Entities --------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  /** Set when RLS is enabled; creator has access before being added as member. */
  created_by: string | null;
  created_at: string;
}

export interface ClientMember {
  id: string;
  client_id: string | null;
  project_id: string | null;
  user_id: string;
  role: UserRole;
  added_at: string;
}

export interface Project {
  id: string;
  client_id: string | null;
  user_id: string; // Primary owner
  name: string;
  status: ProjectStatus;
  created_at: string;
}

/**
 * Represents one day's Start-of-Day workspace.
 * Each user gets at most one DayLog per calendar date.
 */
export interface DayLog {
  id: string;
  user_id: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  created_at: string;
}

/**
 * A single work item inside a DayLog.
 *
 * This is the **single source of truth** for all work tracking.
 * Completed tasks are never duplicated — client activity, project timelines,
 * EOD summaries, and the global timeline all query this same record.
 */
export interface Task {
  id: string;
  content: string;
  day_log_id: string;
  user_id: string;
  client_id: string | null;
  project_id: string | null;
  priority: TaskPriority | null;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  position: number;
  source: TaskSource;
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  client_id: string | null;
  notes: string;
  meeting_date: string;
  created_by: string;
  created_at: string;
}

export interface InboxItem {
  id: string;
  content: string;
  user_id: string;
  is_processed: boolean;
  created_at: string;
}

export type InviteStatus = "pending" | "accepted" | "declined";

export interface ClientInvite {
  id: string;
  client_id: string | null;
  project_id: string | null;
  email: string;
  token: string;
  invited_by: string;
  role: UserRole;
  status: InviteStatus;
  created_at: string;
}

// ---- Creation Inputs -------------------------------------------------------
// Omit server-generated fields so callers only supply what they control.

export type CreateUser = Omit<User, "id" | "created_at">;

export type CreateClient = Omit<Client, "id" | "created_at">;

export type CreateClientMember = Omit<ClientMember, "id" | "added_at">;

export type CreateProject = Omit<Project, "id" | "created_at">;

export type CreateDayLog = Omit<DayLog, "id" | "created_at">;

export type CreateTask = Omit<
  Task,
  "id" | "is_completed" | "completed_at" | "completed_by" | "created_at"
>;

export type CreateMeeting = Omit<Meeting, "id" | "created_at">;

export type CreateInboxItem = Omit<InboxItem, "id" | "is_processed" | "created_at">;

export type CreateInvite = Omit<ClientInvite, "id" | "status" | "created_at">;

// ---- Update Inputs ---------------------------------------------------------
// Partial updates – only the fields the caller wants to change.

export type UpdateTask = Partial<
  Pick<
    Task,
    | "content"
    | "client_id"
    | "project_id"
    | "priority"
    | "is_completed"
    | "completed_at"
    | "completed_by"
    | "position"
  >
>;

export type UpdateProject = Partial<Pick<Project, "name" | "status">>;

export type UpdateMeeting = Partial<Pick<Meeting, "title" | "notes" | "client_id">>;

export type UpdateInboxItem = Partial<Pick<InboxItem, "content" | "is_processed">>;
