# Work OS — Personal Work Operating System

Work OS is a high-performance, personal productivity system designed for professionals in startup environments. It goes beyond a simple to-do list, acting as a "Single Source of Truth" for managing daily workflows, multiple clients, project progress, and meeting captures.

## 🚀 The Core Philosophy
In a fast-paced environment, information often gets scattered across diaries, notepads, and various project management tools. **Work OS** centralizes these into one logical flow:
1. **Plan** at the start of the day (SOD).
2. **Execute** & **Capture** during meetings and calls.
3. **Review** and **Snapshot** at the end of the day (EOD).

---

## ✨ Key Features

### 1. Daily Planning (SOD / EOD)
A structured workflow to start and end your day.
- **SOD Plan:** Outline what needs to be accomplished.
- **EOD Summary:** Automatic snapshot of completed tasks and items to be rolled over to the next day.

### 2. Smart Task Linking System
Advanced parsing logic allows you to link tasks to contexts while you type:
- `@ClientName` → Links task to a specific client.
- `#ProjectName` → Links task to a specific project.
- `!high` / `!medium` / `!low` → Sets task priority.
*Example: "Fix login bug @AcmeCorp #AuthEngine !high"*

### 3. Client & Project Management
- **Centralized Client Pages:** View every project, task, and meeting note related to a specific client.
- **Project Tracking:** Real-time status tracking (Planned, In Progress, Completed, Blocked) and work timelines.

### 4. Meeting Notes & Inbox
- **Quick Capture:** Instantly store thoughts or instructions in the "Work Inbox" and organize them later.
- **Meeting Notes:** Dedicated system to record minutes and convert them directly into actionable tasks.

### 5. Global Work Timeline
A historical record of every single action taken. You can drill down by date, client, or project to review what work was done in the past.

### 6. Team Collaboration
Isolated collaboration at the client level.
- Invite teammates to specific clients.
- Collaborators can only see and manage shared client work.
- Personal logs (SOD/EOD) remain private and visible only to the owner.

---

## 🛠️ Technology Stack
- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Radix UI (shadcn/ui style)
- **State Management:** Zustand (with Persistence)
- **Backend/DB:** Supabase (PostgreSQL)
- **Security:** Row Level Security (RLS) policies for multi-tenant isolation.
- **Animations:** Framer Motion for a premium feel.

---

## 📂 Project Structure
```text
/app             # Next.js Routes & Pages
/components      # Reusable UI & Feature-specific modules
/lib/api         # Direct database access layer (Supabase)
/lib/parsers     # Smart Input Parsing logic
/store           # Global UI/Auth state (Zand)
/supabase        # DB Migrations & RLS Policies
/types           # Shared TypeScript interfaces
```

---

## 🛠️ Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env.local` file with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Development:**
   ```bash
   npm run dev
   ```

4. **Database Setup:**
   Run the SQL migrations found in `/supabase/migrations` to set up tables and RLS policies.
