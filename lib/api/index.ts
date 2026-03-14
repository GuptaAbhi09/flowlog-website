// ---------------------------------------------------------------------------
// Work OS – API Layer (Supabase)
// ---------------------------------------------------------------------------
// All data access flows through this module. Components import from
// `@/lib/api` only.
// ---------------------------------------------------------------------------

// Auth
export {
  login,
  signUp,
  getCurrentUser,
  getProfiles,
  updateProfile,
  updatePassword,
  logoutSupabase,
} from "./auth";

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
export {
  getClients,
  getClientById,
  getClientDetail,
  getClientActivity,
  createClient,
  updateClient,
  addClientMember,
  removeClientMember,
} from "./clients";

// Projects
export {
  getProjects,
  getProjectById,
  getProjectDetail,
  createProject,
  updateProject,
} from "./projects";

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
