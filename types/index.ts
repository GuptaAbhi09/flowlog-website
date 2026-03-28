// ---------------------------------------------------------------------------
// Barrel export + UI / utility types
// ---------------------------------------------------------------------------

export * from "./database";

// ---- Smart Input Parser Result ---------------------------------------------

export interface ParsedTask {
  content: string;
  clientName: string | null;
  projectName: string | null;
  priority: import("./database").TaskPriority | null;
}

export interface IntelligentParsedResult {
  clientId: string | null;
  projectId: string | null;
  confidence: number;
  clientName: string | null;
  projectName: string | null;
  content: string;
  priority: import("./database").TaskPriority | null;
  matchDetails: {
    client: { id: string | null; name: string | null; confidence: number };
    project: { id: string | null; name: string | null; confidence: number };
  };
}

// ---- Enriched Display Types ------------------------------------------------
// Joined data used by UI components so we don't scatter lookups everywhere.

export interface TaskWithDetails {
  task: import("./database").Task;
  clientName: string | null;
  projectName: string | null;
  completedByName: string | null;
  completedByAvatar: string | null;
}

export interface DayLogWithTasks {
  dayLog: import("./database").DayLog;
  tasks: import("./database").Task[];
}

export interface ClientWithProjects {
  client: import("./database").Client;
  projects: import("./database").Project[];
  members: Array<import("./database").ClientMember & { userName: string; userAvatar: string | null }>;
  invites: import("./database").ClientInvite[];
  currentRole: import("./database").UserRole | null;
}

export interface ProjectWithTasks {
  project: import("./database").Project;
  clientName: string;
  tasks: TaskWithDetails[];
  pendingTasks: import("./database").Task[];
  clientInfo?: ClientWithProjects;
}

export interface TimelineEntry {
  task: import("./database").Task;
  clientName: string | null;
  projectName: string | null;
  completedByName: string;
  date: string;
}

// ---- Timeline Filters ------------------------------------------------------

export interface TimelineFilters {
  clientId: string | null;
  projectId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

// ---- Navigation ------------------------------------------------------------

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}
