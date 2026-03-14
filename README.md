# Work OS — Personal & Team Productivity Operating System

Work OS is a high-performance work management system designed for professionals and startup teams. It acts as a "Single Source of Truth" for managing complex workflows, multiple clients, project progress, and collaborative team activity.

## 🚀 The Core Philosophy
In a fast-paced environment, information often gets scattered. **Work OS** centralizes these into one logical flow:
1. **Plan** at the start of the day (SOD).
2. **Execute** & **Capture** during meetings and team calls.
3. **Review** and **Snapshot** at the end of the day (EOD).

---

## ✨ Key Features

### 1. Daily Planning & Snapshots (SOD / EOD)
A structured workflow to focus your energy.
- **SOD Plan:** High-intensity planning at the start of the day.
- **EOD Summary:** Automatic summary of accomplishments, stored as a permanent record.

### 2. Smart Task Linking System
Advanced NLP-style parsing lets you categorize while you type:
- `@ClientName` → Automatically links task to a client.
- `#ProjectName` → Automatically links task to a project.
- `!high/medium/low` → Sets task priority.

### 3. Professional Team Collaboration
Transform personal productivity into team transparency:
- **Client-Level Invitations:** Invite teammates to collaborate on specific clients.
- **Strict Identity Validation:** Invitations are locked to specific email addresses for security.
- **Role-Based Access (RBAC):** 
    - **Owners:** Can manage projects, invite/remove members, and update client details.
    - **Collaborators:** Can create tasks, check off work, and view shared activity without modifying core structures.
- **Task Attribution:** Every task completion is stamped with `Completed By` and `Completed At`.

### 4. Meeting Notes & Action Items
- **Meeting to Task:** Instantly convert meeting minutes into actionable tasks with one click, preserving the client context.
- **Activity Feed:** Real-time feed of team progress within each client dashboard.

### 5. Multi-Tenant Privacy (RLS Architecture)
Built with security at the core using Supabase Row Level Security:
- **Privacy First:** Your personal Day Logs, Inbox, and private tasks are **invisible** to anyone else, even your team members.
- **Shared Context:** Only work specifically linked to a shared Client/Project is visible to invited teammates.

---

## 🛠️ Technology Stack
- **Frontend:** Next.js 14 (App Router)
- **Styling:** Vanilla CSS + Radix UI + Lucide Icons
- **State Management:** Zustand (Persisted)
- **Backend/DB:** Supabase (PostgreSQL)
- **Security:** Strict RLS Policies & Identity-verified Invitations
- **Animations:** Framer Motion

---

## 📂 Database & Migrations
The database logic is divided into structured migrations:
- `01_base_schema.sql`: Core tables, trigger for user profiles.
- `02_collaboration_v1.sql`: Invitation systems and attribution schema.
- `03_rls_policies.sql`: Refined security layer for team/personal isolation.

---

## 🛠️ Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. **Supabase Setup:**
   - Run the SQL files in `/supabase/migrations` via the Supabase SQL Editor.
   - Set **Auth Redirect URLs** to `http://localhost:3000/**` in the Supabase Dashboard.

4. **Run Development:**
   ```bash
   npm run dev
   ```

---

## 🚀 Future Roadmap
- [ ] Automated Email Invites via Resend.
- [ ] Gantt Chart Visualization for Project Timelines.
- [ ] AI-assisted SOD planning based on previous day's performance.
