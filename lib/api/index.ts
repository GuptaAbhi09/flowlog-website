// ---------------------------------------------------------------------------
// Work OS – Mock API Layer
// ---------------------------------------------------------------------------
// All data access flows through this module. Components import from
// `@/lib/api` and never touch mock data directly.
//
// When migrating to Supabase, replace the implementations in each file
// while keeping the same function signatures.
// ---------------------------------------------------------------------------

// Auth
export { login, getCurrentUser } from "./auth";

// Day Logs
export {
  getDayLogByDate,
  getOrCreateTodayLog,
  getDayLogHistory,
  createDayLogForDate,
} from "./dayLogs";

// Tasks
export {
  getTasksByDayLogId,
  getTasksByDate,
  getCompletedTasksByClient,
  getCompletedTasksByProject,
  createTaskFromInput,
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
  reorderTasks,
  rollPendingToToday,
} from "./tasks";

// Clients
export { getClients, getClientDetail, getClientActivity } from "./clients";

// Projects
export { getProjects, getProjectDetail } from "./projects";

// Meetings
export {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
} from "./meetings";

// Inbox
export {
  getInboxItems,
  getUnprocessedCount,
  createInboxItem,
  updateInboxItem,
  deleteInboxItem,
  convertInboxToTask,
} from "./inbox";

// Timeline
export { getTimeline } from "./timeline";
