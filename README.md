# Flowlog: Your Personal Work Operating System

Flowlog is a daily work tracker for developers, freelancers, and team leads who manage multiple clients and projects simultaneously. It helps you plan your day, track your work, and keep a permanent history of everything you build.

## ✨ Key Features

### 📅 Daily Workspace (SOD & EOD)
- **Start of Day (SOD)**: Plan your daily work in plain English.
- **End of Day (EOD)**: Your daily work diary is automatically generated from the tasks you check off.
- **Midnight Rollover**: Never manually copy unfinished work again. Unfinished tasks automatically roll over to the next day at exactly 12:00 AM via a background process.
- **Pick Date**: Travel back in time to view exactly what you planned and accomplished on any given past day.

### 🧠 Intelligent Task Parsing
- **Natural Language Parsing**: Type your task normally (e.g., "Fix login bug for ConnectHub App"). Flowlog uses intelligent text matching to automatically link the task to the correct Client and Project without needing manual tags.
- **Manual Overrides**: For precise control, use the `@ClientName`, `#ProjectName`, and `!priority` syntax to manually assign properties.

### 🏢 Client & Project Organization
- **Dedicated Workspaces**: Keep your paid client projects strictly separated from your independent personal projects.
- **Team Collaboration**: Invite teammates to a specific Client to give them full access, or restrict them to a specific Project.
- **Client Updates**: Maintain a running log of status reports per client, keeping a perfect chronological history of your accomplishments and upcoming plans.

### ⚡ Quick Capture & Meetings
- **The Inbox**: A distraction-free zone to quickly dump incoming ideas and tasks. Later, convert them into your Daily Workspace.
- **Meeting Reminders**: Schedule upcoming calls and let Flowlog send you an email reminder with your agenda/notes exactly when you need it.

### 📜 The Timeline
- **Permanent Professional Record**: A chronological overview of every task you've ever completed across all clients. Use filters to make invoicing and performance reviews effortless.

## 🛠️ Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: Zustand
- **Date Handling**: date-fns

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GuptaAbhi09/flowlog-website.git
   cd flowlog-website
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup:**
   Apply the migrations located in the `supabase/migrations` folder to your Supabase project.

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤝 Roadmap
- [ ] Mobile App (React Native/Expo)
- [ ] Real-time Chat within projects
- [ ] Automatic meeting transcript parsing & action item extraction
- [ ] Third-party Integrations (Slack, Discord, Google Calendar)

## 👤 Ownership

This project is authored, owned, and maintained by **Abhishek Gupta** ([@GuptaAbhi09](https://github.com/GuptaAbhi09)). All rights reserved.

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ by [Abhishek Gupta](https://github.com/GuptaAbhi09)
