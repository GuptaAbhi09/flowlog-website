"use client";

import { 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  Hash, 
  AtSign, 
  AlertCircle,
  Users,
  LayoutDashboard,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Everything you need to know about using Flowlog effectively.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Core Concepts */}
        <Card className="col-span-full border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              The Flowlog Philosophy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            Flowlog is built around the **SOD (Start of Day)** and **EOD (End of Day)** ritual. 
            The goal is to help you plan your work in the morning, track it during the day, 
            and reflect on your productivity in the evening. It's designed to be fast, 
            minimizing the time spent on "tool management" so you can focus on actual work.
          </CardContent>
        </Card>

        {/* Quick Help: Task Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" />
              Smart Task Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add tasks quickly using our intelligent tag system:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-primary">@</Badge>
                <span>Mention a <strong>Client</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-primary">#</Badge>
                <span>Tag a <strong>Project</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-primary">!</Badge>
                <span>Set <strong>Priority</strong> (high, medium, low)</span>
              </li>
            </ul>
            <div className="rounded bg-muted p-2 text-xs font-mono">
               Finish marketing UI @Acme #Redesign !high
            </div>
          </CardContent>
        </Card>

        {/* Workspace Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LayoutDashboard className="h-4 w-4" />
              Daily Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
              <p>Work items marked complete in SOD automatically appear in your EOD summary.</p>
            </div>
            <div className="flex gap-3">
              <AlertCircle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
              <p>Unfinished items from yesterday can be "rolled over" to today with one click.</p>
            </div>
            <div className="flex gap-3">
              <Calendar className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
              <p>Navigate through your history using the date picker to review past progress.</p>
            </div>
          </CardContent>
        </Card>

        {/* Collaboration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Share your workspace with your team:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Invite members to a <strong>Client</strong> for full access to all its projects.</li>
              <li>Invite members to a specific <strong>Project</strong> for restricted access.</li>
              <li>Collaborators can see and mark tasks as completed in shared projects.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Step-by-Step Guide</h2>
        
        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
              <h3 className="font-medium">Setup your Clients</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-11">
              Go to the **Clients** page and create your first client (e.g., a company name or "Personal"). 
              Under each client, create **Projects** to organize specific work efforts.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
              <h3 className="font-medium">Start your Day</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-11">
              Every morning, open the **Daily Workspace**. Use the input field to list what you plan to do today. 
              Don't forget to use tags like `@client` to link tasks to their respective goals.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
              <h3 className="font-medium">Track Progress</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-11">
              As you finish work, click the circle next to a task. It will be marked as complete and timestamped. 
              Completed work automatically fills your **Timeline** and Client activity logs.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">4</div>
              <h3 className="font-medium">End of Day Wrap-up</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-11">
              Switch to the **End of Day** tab to see your summary. This is a great time to review 
              your achievements and note down what needs to be prioritized for tomorrow.
            </p>
          </div>
        </section>
      </div>

      {/* Shortcuts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              What happens if I don't finish my tasks?
            </h4>
            <p className="text-sm text-muted-foreground">
              Don't worry! If you visit a past day's workspace, you'll see a **"Roll to Today"** button 
              under any pending tasks. Clicking it will copy those tasks directly to your current SOD.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Where can I see all my work history?
            </h4>
            <p className="text-sm text-muted-foreground">
              The **Timeline** page shows a global feed of everything you've completed. 
              You can filter this by Client, Project, or Date to find specific work items.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
