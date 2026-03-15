# FlowLog: The Ultimate Professional Workspace

FlowLog is a powerful, modern daily workspace designed for professionals and teams to manage clients, projects, and tasks with precision. It streamlines the "Start of Day" (SOD) and "End of Day" (EOD) workflows while providing granular control over team collaboration.

## ✨ Key Features

### 🏢 Client & Project Management
- **Hierarchical Access**: Organize work by Clients and then by Projects.
- **Deep Control**: Invite teammates to an entire Client (full access) or just a specific Project (restricted access).
- **Team Insights**: See exactly who is working on what with dedicated team views and avatars.

### ✍️ Smart Daily Log (SOD/EOD)
- **Start of Day (SOD)**: Plan your day by listing tasks you intend to complete.
- **End of Day (EOD)**: Automatically summarize your progress and see what was achieved.
- **Task History**: Never lose track of past work with a full calendar-based archive.

### ⚡ Quick-Add Task Parser
- **Shortcut Support**: Add tasks at lightning speed using `@` for Clients, `#` for Projects, and `!` for Priority.
- **Smart Autocomplete**: Real-time suggestions pop up as you type, so you don't have to remember names.

### 🖼️ Professional Profiles
- **Custom Avatars**: Upload and crop your profile picture directly in the app.
- **Branding**: Consistent user identity throughout the platform, from sidebars to task history.

### 🔒 Enterprise-Grade Security
- **Privacy First**: Built with Supabase RLS, ensuring your data is only visible to you and your authorized teammates.
- **Verified Invites**: A secure invitation system ensures only the right people can join your workspace.

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
- [ ] Advanced Analytics and Productivity Insights
- [ ] Third-party Integrations (Slack, Discord, Google Calendar)

## 👤 Ownership

This project is authored, owned, and maintained by **Abhi Gupta** ([@GuptaAbhi09](https://github.com/GuptaAbhi09)). All rights reserved.

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ by [Abhishek Gupta](https://github.com/GuptaAbhi09)
