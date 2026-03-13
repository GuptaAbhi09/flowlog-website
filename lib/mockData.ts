import type {
  User,
  Client,
  ClientMember,
  Project,
  DayLog,
  Task,
  Meeting,
  InboxItem,
} from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _idCounter = 100;
export function nextId(): string {
  return String(++_idCounter);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function completedAt(daysAgo: number, hour: number, min: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const users: User[] = [
  {
    id: "user-1",
    email: "rahul@workos.dev",
    name: "Rahul Sharma",
    created_at: daysAgo(90),
  },
  {
    id: "user-2",
    email: "abhishek@workos.dev",
    name: "Abhishek Verma",
    created_at: daysAgo(90),
  },
  {
    id: "user-3",
    email: "aman@workos.dev",
    name: "Aman Singh",
    created_at: daysAgo(60),
  },
];

export const CURRENT_USER = users[0];

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export const clients: Client[] = [
  { id: "client-1", name: "Acme Corp", created_at: daysAgo(80) },
  { id: "client-2", name: "Starter Inc", created_at: daysAgo(70) },
  { id: "client-3", name: "CloudBase", created_at: daysAgo(50) },
  { id: "client-4", name: "FinLedger", created_at: daysAgo(30) },
];

// ---------------------------------------------------------------------------
// Client Members
// ---------------------------------------------------------------------------

export const clientMembers: ClientMember[] = [
  { id: "cm-1", client_id: "client-1", user_id: "user-1", role: "owner", added_at: daysAgo(80) },
  { id: "cm-2", client_id: "client-1", user_id: "user-2", role: "collaborator", added_at: daysAgo(75) },
  { id: "cm-3", client_id: "client-2", user_id: "user-1", role: "owner", added_at: daysAgo(70) },
  { id: "cm-4", client_id: "client-2", user_id: "user-3", role: "collaborator", added_at: daysAgo(60) },
  { id: "cm-5", client_id: "client-3", user_id: "user-2", role: "owner", added_at: daysAgo(50) },
  { id: "cm-6", client_id: "client-3", user_id: "user-1", role: "collaborator", added_at: daysAgo(45) },
  { id: "cm-7", client_id: "client-4", user_id: "user-1", role: "owner", added_at: daysAgo(30) },
  { id: "cm-8", client_id: "client-4", user_id: "user-3", role: "collaborator", added_at: daysAgo(28) },
];

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projects: Project[] = [
  // Acme Corp
  { id: "proj-1", client_id: "client-1", name: "Website Redesign", status: "in_progress", created_at: daysAgo(60) },
  { id: "proj-2", client_id: "client-1", name: "Mobile App", status: "planned", created_at: daysAgo(20) },
  // Starter Inc
  { id: "proj-3", client_id: "client-2", name: "Landing Page", status: "completed", created_at: daysAgo(65) },
  { id: "proj-4", client_id: "client-2", name: "API Integration", status: "in_progress", created_at: daysAgo(40) },
  // CloudBase
  { id: "proj-5", client_id: "client-3", name: "Dashboard UI", status: "in_progress", created_at: daysAgo(45) },
  { id: "proj-6", client_id: "client-3", name: "Auth System", status: "blocked", created_at: daysAgo(30) },
  // FinLedger
  { id: "proj-7", client_id: "client-4", name: "Payment Gateway", status: "in_progress", created_at: daysAgo(25) },
  { id: "proj-8", client_id: "client-4", name: "Reports Module", status: "planned", created_at: daysAgo(10) },
];

// ---------------------------------------------------------------------------
// Day Logs  (last 5 days for the current user)
// ---------------------------------------------------------------------------

export const dayLogs: DayLog[] = [
  { id: "dl-today", user_id: "user-1", date: todayStr(), created_at: daysAgo(0) },
  { id: "dl-1", user_id: "user-1", date: dateStr(1), created_at: daysAgo(1) },
  { id: "dl-2", user_id: "user-1", date: dateStr(2), created_at: daysAgo(2) },
  { id: "dl-3", user_id: "user-1", date: dateStr(3), created_at: daysAgo(3) },
  { id: "dl-4", user_id: "user-1", date: dateStr(4), created_at: daysAgo(4) },
];

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export const tasks: Task[] = [
  // ── Today's Day Log (dl-today) ──────────────────────────────────────────
  {
    id: "task-1",
    content: "Fix login redirect bug @Acme Corp #Website Redesign !high",
    day_log_id: "dl-today",
    user_id: "user-1",
    client_id: "client-1",
    project_id: "proj-1",
    priority: "high",
    is_completed: false,
    completed_at: null,
    completed_by: null,
    position: 0,
    source: "sod",
    created_at: daysAgo(0),
  },
  {
    id: "task-2",
    content: "Review PR for payment flow @FinLedger #Payment Gateway !medium",
    day_log_id: "dl-today",
    user_id: "user-1",
    client_id: "client-4",
    project_id: "proj-7",
    priority: "medium",
    is_completed: false,
    completed_at: null,
    completed_by: null,
    position: 1,
    source: "sod",
    created_at: daysAgo(0),
  },
  {
    id: "task-3",
    content: "Write unit tests for auth module @CloudBase #Auth System",
    day_log_id: "dl-today",
    user_id: "user-1",
    client_id: "client-3",
    project_id: "proj-6",
    priority: null,
    is_completed: false,
    completed_at: null,
    completed_by: null,
    position: 2,
    source: "sod",
    created_at: daysAgo(0),
  },
  {
    id: "task-4",
    content: "Team standup call",
    day_log_id: "dl-today",
    user_id: "user-1",
    client_id: null,
    project_id: null,
    priority: null,
    is_completed: false,
    completed_at: null,
    completed_by: null,
    position: 3,
    source: "sod",
    created_at: daysAgo(0),
  },

  // ── Yesterday (dl-1) ───────────────────────────────────────────────────
  {
    id: "task-5",
    content: "Deploy staging build @Acme Corp #Website Redesign !high",
    day_log_id: "dl-1",
    user_id: "user-1",
    client_id: "client-1",
    project_id: "proj-1",
    priority: "high",
    is_completed: true,
    completed_at: completedAt(1, 11, 30),
    completed_by: "user-1",
    position: 0,
    source: "sod",
    created_at: daysAgo(1),
  },
  {
    id: "task-6",
    content: "Update API documentation @Starter Inc #API Integration",
    day_log_id: "dl-1",
    user_id: "user-1",
    client_id: "client-2",
    project_id: "proj-4",
    priority: null,
    is_completed: true,
    completed_at: completedAt(1, 14, 15),
    completed_by: "user-1",
    position: 1,
    source: "sod",
    created_at: daysAgo(1),
  },
  {
    id: "task-7",
    content: "Setup CI/CD pipeline @CloudBase #Dashboard UI !medium",
    day_log_id: "dl-1",
    user_id: "user-1",
    client_id: "client-3",
    project_id: "proj-5",
    priority: "medium",
    is_completed: true,
    completed_at: completedAt(1, 16, 45),
    completed_by: "user-1",
    position: 2,
    source: "sod",
    created_at: daysAgo(1),
  },
  {
    id: "task-8",
    content: "Research SSO integration options @FinLedger !low",
    day_log_id: "dl-1",
    user_id: "user-1",
    client_id: "client-4",
    project_id: null,
    priority: "low",
    is_completed: false,
    completed_at: null,
    completed_by: null,
    position: 3,
    source: "sod",
    created_at: daysAgo(1),
  },

  // ── 2 days ago (dl-2) ──────────────────────────────────────────────────
  {
    id: "task-9",
    content: "Design new dashboard layout @CloudBase #Dashboard UI !high",
    day_log_id: "dl-2",
    user_id: "user-1",
    client_id: "client-3",
    project_id: "proj-5",
    priority: "high",
    is_completed: true,
    completed_at: completedAt(2, 10, 0),
    completed_by: "user-1",
    position: 0,
    source: "sod",
    created_at: daysAgo(2),
  },
  {
    id: "task-10",
    content: "Fix responsive nav @Acme Corp #Website Redesign",
    day_log_id: "dl-2",
    user_id: "user-1",
    client_id: "client-1",
    project_id: "proj-1",
    priority: null,
    is_completed: true,
    completed_at: completedAt(2, 13, 20),
    completed_by: "user-1",
    position: 1,
    source: "sod",
    created_at: daysAgo(2),
  },
  {
    id: "task-11",
    content: "Client meeting prep @Starter Inc",
    day_log_id: "dl-2",
    user_id: "user-1",
    client_id: "client-2",
    project_id: null,
    priority: null,
    is_completed: true,
    completed_at: completedAt(2, 15, 0),
    completed_by: "user-1",
    position: 2,
    source: "meeting",
    created_at: daysAgo(2),
  },
  {
    id: "task-12",
    content: "Investigate memory leak in backend @CloudBase #Auth System !high",
    day_log_id: "dl-2",
    user_id: "user-1",
    client_id: "client-3",
    project_id: "proj-6",
    priority: "high",
    is_completed: false,
    completed_at: null,
    completed_by: null,
    position: 3,
    source: "sod",
    created_at: daysAgo(2),
  },

  // ── 3 days ago (dl-3) ──────────────────────────────────────────────────
  {
    id: "task-13",
    content: "Setup project repo @FinLedger #Payment Gateway",
    day_log_id: "dl-3",
    user_id: "user-1",
    client_id: "client-4",
    project_id: "proj-7",
    priority: null,
    is_completed: true,
    completed_at: completedAt(3, 9, 30),
    completed_by: "user-1",
    position: 0,
    source: "sod",
    created_at: daysAgo(3),
  },
  {
    id: "task-14",
    content: "Wireframe approval call @Acme Corp #Mobile App !medium",
    day_log_id: "dl-3",
    user_id: "user-1",
    client_id: "client-1",
    project_id: "proj-2",
    priority: "medium",
    is_completed: true,
    completed_at: completedAt(3, 11, 0),
    completed_by: "user-1",
    position: 1,
    source: "meeting",
    created_at: daysAgo(3),
  },
  {
    id: "task-15",
    content: "Code review: landing page final @Starter Inc #Landing Page",
    day_log_id: "dl-3",
    user_id: "user-1",
    client_id: "client-2",
    project_id: "proj-3",
    priority: null,
    is_completed: true,
    completed_at: completedAt(3, 14, 30),
    completed_by: "user-1",
    position: 2,
    source: "sod",
    created_at: daysAgo(3),
  },
  {
    id: "task-16",
    content: "Write test cases for payment module @FinLedger #Payment Gateway !high",
    day_log_id: "dl-3",
    user_id: "user-1",
    client_id: "client-4",
    project_id: "proj-7",
    priority: "high",
    is_completed: true,
    completed_at: completedAt(3, 17, 0),
    completed_by: "user-1",
    position: 3,
    source: "sod",
    created_at: daysAgo(3),
  },

  // ── 4 days ago (dl-4) ──────────────────────────────────────────────────
  {
    id: "task-17",
    content: "Initial dashboard prototype @CloudBase #Dashboard UI",
    day_log_id: "dl-4",
    user_id: "user-1",
    client_id: "client-3",
    project_id: "proj-5",
    priority: null,
    is_completed: true,
    completed_at: completedAt(4, 10, 45),
    completed_by: "user-1",
    position: 0,
    source: "sod",
    created_at: daysAgo(4),
  },
  {
    id: "task-18",
    content: "Scope new reporting feature @FinLedger #Reports Module !medium",
    day_log_id: "dl-4",
    user_id: "user-1",
    client_id: "client-4",
    project_id: "proj-8",
    priority: "medium",
    is_completed: true,
    completed_at: completedAt(4, 13, 15),
    completed_by: "user-1",
    position: 1,
    source: "sod",
    created_at: daysAgo(4),
  },
  {
    id: "task-19",
    content: "Deploy landing page to production @Starter Inc #Landing Page !high",
    day_log_id: "dl-4",
    user_id: "user-1",
    client_id: "client-2",
    project_id: "proj-3",
    priority: "high",
    is_completed: true,
    completed_at: completedAt(4, 15, 30),
    completed_by: "user-1",
    position: 2,
    source: "sod",
    created_at: daysAgo(4),
  },
  {
    id: "task-20",
    content: "Update environment configs @Acme Corp #Website Redesign !low",
    day_log_id: "dl-4",
    user_id: "user-1",
    client_id: "client-1",
    project_id: "proj-1",
    priority: "low",
    is_completed: false,
    completed_at: null,
    completed_by: null,
    position: 3,
    source: "sod",
    created_at: daysAgo(4),
  },
];

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------

export const meetings: Meeting[] = [
  {
    id: "meet-1",
    title: "Sprint Planning - Acme Corp",
    client_id: "client-1",
    notes: [
      "Discussed website redesign milestones",
      "Agreed on mobile app timeline — kick off next month",
      "Rahul to handle login bug fix this week",
      "Need to finalize color palette by Friday",
    ].join("\n"),
    meeting_date: dateStr(1),
    created_by: "user-1",
    created_at: daysAgo(1),
  },
  {
    id: "meet-2",
    title: "API Review - Starter Inc",
    client_id: "client-2",
    notes: [
      "Reviewed REST endpoints for v2",
      "Need to add rate limiting before launch",
      "Aman will write integration tests",
      "Landing page confirmed complete — moving to API work",
    ].join("\n"),
    meeting_date: dateStr(2),
    created_by: "user-1",
    created_at: daysAgo(2),
  },
  {
    id: "meet-3",
    title: "CloudBase Architecture Sync",
    client_id: "client-3",
    notes: [
      "Auth system blocked on third-party SSO provider",
      "Dashboard prototype approved",
      "Abhishek to lead auth unblocking effort",
      "Next review in one week",
    ].join("\n"),
    meeting_date: dateStr(3),
    created_by: "user-2",
    created_at: daysAgo(3),
  },
  {
    id: "meet-4",
    title: "FinLedger Kickoff",
    client_id: "client-4",
    notes: [
      "Introduced team to client stakeholders",
      "Payment gateway is top priority",
      "Reports module scoping begins next week",
      "Weekly sync every Monday 10 AM",
    ].join("\n"),
    meeting_date: dateStr(4),
    created_by: "user-1",
    created_at: daysAgo(4),
  },
  {
    id: "meet-5",
    title: "Internal Retro",
    client_id: null,
    notes: [
      "Discussed process improvements",
      "Agreed to use Work OS for daily logging",
      "Will review workflow again in 2 weeks",
    ].join("\n"),
    meeting_date: dateStr(3),
    created_by: "user-1",
    created_at: daysAgo(3),
  },
];

// ---------------------------------------------------------------------------
// Inbox Items
// ---------------------------------------------------------------------------

export const inboxItems: InboxItem[] = [
  {
    id: "inbox-1",
    content: "Look into Stripe webhooks for FinLedger",
    user_id: "user-1",
    is_processed: false,
    created_at: daysAgo(0),
  },
  {
    id: "inbox-2",
    content: "Idea: add dark mode toggle to CloudBase dashboard",
    user_id: "user-1",
    is_processed: false,
    created_at: daysAgo(1),
  },
  {
    id: "inbox-3",
    content: "Check if Acme Corp logo assets were updated",
    user_id: "user-1",
    is_processed: false,
    created_at: daysAgo(1),
  },
  {
    id: "inbox-4",
    content: "Read article on Next.js server actions",
    user_id: "user-1",
    is_processed: true,
    created_at: daysAgo(3),
  },
  {
    id: "inbox-5",
    content: "Schedule call with Starter Inc PM about v2 timeline",
    user_id: "user-1",
    is_processed: true,
    created_at: daysAgo(4),
  },
  {
    id: "inbox-6",
    content: "Explore dnd-kit for task reordering",
    user_id: "user-1",
    is_processed: true,
    created_at: daysAgo(5),
  },
];

// ---------------------------------------------------------------------------
// Quick lookup maps (used by the API layer)
// ---------------------------------------------------------------------------

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getClientById(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getClientByName(name: string): Client | undefined {
  return clients.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getProjectByName(name: string): Project | undefined {
  return projects.find((p) => p.name.toLowerCase() === name.toLowerCase());
}
