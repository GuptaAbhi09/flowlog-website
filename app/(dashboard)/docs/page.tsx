"use client";

import { 
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Users,
  LayoutDashboard,
  Inbox,
  Video,
  Layers,
  Zap,
  ArrowRight,
  Hash,
  AtSign,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="text-center space-y-4 pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Zap className="h-3 w-3" />
          Master Flowlog
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">The Official Guide to Flowlog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Unlock your full productivity potential. Learn how to structure your work, collaborate with teams, and never miss a beat.
        </p>
      </section>

      {/* Quick Navigation Tabs */}
      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl">
          <TabsTrigger value="basics" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">The Basics</TabsTrigger>
          <TabsTrigger value="workspace" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Workspaces</TabsTrigger>
          <TabsTrigger value="collaboration" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Collaboration</TabsTrigger>
          <TabsTrigger value="shortcuts" className="py-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Shortcuts</TabsTrigger>
        </TabsList>

        {/* 1. THE BASICS */}
        <TabsContent value="basics" className="mt-8 space-y-8 outline-none border-none">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                    <Layers className="h-5 w-5" />
                  </div>
                  Understanding Hierarchy
                </CardTitle>
                <CardDescription>How Flowlog organizes your work world</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1 shrink-0">1. Clients</Badge>
                    <p className="text-sm text-muted-foreground font-medium">The top level. Represents a company, a business partner, or a major life category (e.g., &quot;Freelance&quot;, &quot;Personal&quot;).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1 shrink-0">2. Projects</Badge>
                    <p className="text-sm text-muted-foreground font-medium">Specific initiatives under a client. (e.g., &quot;Website Redesign&quot; under client &quot;Acme Inc&quot;).</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-1 shrink-0">3. Tasks</Badge>
                    <p className="text-sm text-muted-foreground font-medium">The actual work items. Tasks can belong to a project, a client, or be independent.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border-dashed border-2 flex flex-col items-center gap-2 text-xs font-mono text-muted-foreground">
                  <div className="px-3 py-1 border rounded bg-background shadow-xs">Client (Organization)</div>
                  <ChevronRight className="h-3 w-3 rotate-90" />
                  <div className="px-3 py-1 border rounded bg-background shadow-xs">Project (Initiative)</div>
                  <ChevronRight className="h-3 w-3 rotate-90" />
                  <div className="px-3 py-1 border rounded bg-background shadow-xs">Task (Action Item)</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  The Flow Philosophy
                </CardTitle>
                <CardDescription>Built for focus, not for micro-management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Most tools take hours to set up. Flowlog takes seconds. Our philosophy is **&quot;Capture First, Categorize Later.&quot;**
                </p>
                <p>
                  Every day starts clean. You plan your **SOD (Start of Day)**, execute, and then reflect on your **EOD (End of Day)**. This cycle keeps you accountable and prevents burnout.
                </p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 text-orange-700 border border-orange-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium">Pro Tip: Don&apos;t spend more than 5 mins planning. Just start.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. WORKSPACES */}
        <TabsContent value="workspace" className="mt-8 space-y-8 outline-none border-none">
          <div className="grid gap-8">
            {/* Daily Workspace */}
            <div className="relative pl-10 border-none">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-transparent rounded-full" />
              <div className="absolute left-[-16px] top-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight">Daily Workspace: Your Command Center</h3>
                <p className="text-muted-foreground font-medium">
                  This is where you spend 90% of your time. It is split into two critical phases:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-card/50 border-2">
                    <CardHeader className="pb-2 text-primary">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-4 w-4" /> 
                        SOD (Start of Day)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      List your goals for the day. Use the **Smart Input** to tag clients and projects on the fly. Focus on what you *will* finish today. Items not finished can be rolled over to the next day.
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-2">
                    <CardHeader className="pb-2 text-green-600">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        EOD (End of Day)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground leading-relaxed">
                      A visual summary of your wins. Review completed tasks, see hours spent, and celebrate your progress. This is where you finalize your daily log and prepare for tomorrow.
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Inbox & Meetings */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-lg">The Inbox</h4>
                </div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
                  Capture fleeting thoughts
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Found something interesting? Have a random task idea? Throw it in the Inbox. It&apos;s a distraction-free space to dump ideas so you can stay focused on your current flow. You can convert these items into structured tasks later.
                </p>
              </Card>
              <Card className="p-6 border-2 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                    <Video className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-lg">Meetings & Minutes</h4>
                </div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
                  Actionable meeting notes
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Don&apos;t let meeting notes get lost in notebooks. Record meetings directly in Flowlog, attach them to clients, and convert &quot;To-Dos&quot; mentioned in the meeting into actual tasks on your list with zero friction.
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 3. COLLABORATION */}
        <TabsContent value="collaboration" className="mt-8 space-y-8 outline-none border-none">
          <Card className="overflow-hidden border-2 shadow-sm">
            <div className="bg-primary/5 p-8 border-b">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <Users className="h-7 w-7 text-primary" />
                Working with Teams
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Flowlog is designed for seamless collaboration. Manage team access at different granularities.
              </CardDescription>
            </div>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                <div className="p-8 space-y-4">
                  <div className="p-3 w-fit rounded-xl bg-green-100 text-green-600 shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h5 className="font-extrabold text-lg">Client-wide Access</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">Users invited to a client get full access to **every project** under that client. Perfect for admins and core team members.</p>
                </div>
                <div className="p-8 space-y-4">
                  <div className="p-3 w-fit rounded-xl bg-amber-100 text-amber-600 shadow-sm">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h5 className="font-extrabold text-lg">Project-only Access</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">Restricted &quot;Guest&quot; access. Users only see specific projects. Ideal for external contractors and freelancers.</p>
                </div>
                <div className="p-8 space-y-4">
                  <div className="p-3 w-fit rounded-xl bg-blue-100 text-blue-600 shadow-sm">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h5 className="font-extrabold text-lg">Shared Visibility</h5>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">All members can see the status of shared tasks in real-time. No more sync-up meetings to ask &quot;is this done yet?&quot;</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. SHORTCUTS */}
        <TabsContent value="shortcuts" className="mt-8 space-y-8 outline-none border-none">
          <Card className="border-2 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-6 border-b">
              <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                <Zap className="h-7 w-7 text-primary animate-pulse" />
                The Smart Input Engine
              </CardTitle>
              <CardDescription className="text-base font-medium">Natural language processing for tasks. Speed matters.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="grid sm:grid-cols-3 gap-8">
                <div className="space-y-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 text-primary font-black text-lg">
                    <AtSign className="h-5 w-5" /> Client
                  </div>
                  <div className="p-3 bg-background border shadow-sm rounded-lg font-mono text-sm">@google</div>
                  <p className="text-sm text-muted-foreground font-medium">Immediately links the task to the client named &quot;Google&quot;.</p>
                </div>
                <div className="space-y-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 font-black text-lg">
                    <Hash className="h-5 w-5" /> Project
                  </div>
                  <div className="p-3 bg-background border shadow-sm rounded-lg font-mono text-sm">#redesign</div>
                  <p className="text-sm text-muted-foreground font-medium">Immediately links the task to the specific project.</p>
                </div>
                <div className="space-y-4 p-4 rounded-xl bg-orange-50 border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-600 font-black text-lg">
                    <AlertCircle className="h-5 w-5" /> Priority
                  </div>
                  <div className="p-3 bg-background border shadow-sm rounded-lg font-mono text-sm">!high</div>
                  <p className="text-sm text-muted-foreground font-medium">Sets the priority level instantly: !high, !medium, !low.</p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-black text-sm uppercase tracking-[0.2em] text-muted-foreground">The Magic Command</h4>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative p-8 rounded-2xl bg-background border-2 border-primary/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Input String</span>
                      <Badge variant="secondary" className="font-mono">Real-time Recognition</Badge>
                    </div>
                    <div className="p-5 bg-muted/50 rounded-xl font-mono text-lg md:text-xl border-2 border-dashed flex flex-wrap gap-2 items-center">
                      Finish home section 
                      <span className="px-2 py-0.5 rounded bg-primary text-primary-foreground">@stripe</span> 
                      <span className="px-2 py-0.5 rounded bg-blue-600 text-white">#landing</span> 
                      <span className="px-2 py-0.5 rounded bg-orange-500 text-white">!high</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      Type this and press Enter. Flowlog will parse the string, create the task, link the client, assign the project, and set the priority **in one single operation.**
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* FAQ Section */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black">Common Questions</h2>
          <p className="text-muted-foreground font-medium">Fast answers to clear your hurdles.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              q: "Can I use Flowlog offline?",
              a: "Flowlog requires an active connection to Supabase for secure data sync. Offline support is planned for a future update using persistent local storage."
            },
            {
              q: "What happens to tasks I didn't finish?",
              a: "We never delete unfinished work. You can visit any past day in the Daily Workspace and 'Roll' those tasks into your current Start of Day with one click."
            },
            {
              q: "Is my data private from my team?",
              a: "Yes. Team members only see data for the Clients or Projects they have been explicitly invited to. Your personal projects remain 100% private to you."
            },
            {
              q: "How many clients can I add?",
              a: "During our beta, there are no limits on the number of clients or projects you can create. Structure your work as broadly as you need."
            }
          ].map((item, i) => (
            <Card key={i} className="group hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="pb-3 px-6 pt-6">
                <CardTitle className="text-lg font-extrabold flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                  {item.q}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0">
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="relative overflow-hidden p-12 rounded-[2.5rem] bg-slate-950 text-white text-center space-y-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-24 bg-primary/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 p-24 bg-blue-500/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Ready to master your flow?</h2>
          <p className="max-w-2xl mx-auto opacity-80 leading-relaxed text-lg font-medium">
            The best way to learn is by doing. Start your daily workspace now and see how much faster you become.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="default" size="lg" className="h-14 px-10 font-black text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 group" asChild>
              <a href="/daily" className="gap-2">
                Launch Workspace <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-10 font-black text-lg border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all" asChild>
              <a href="/projects">
                View Projects
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer info */}
      <footer className="text-center text-muted-foreground text-sm pt-12 border-t">
        <p className="font-medium">© 2026 Flowlog Application. Designed for high-performance individuals.</p>
        <div className="flex justify-center gap-8 mt-6">
          <a href="#" className="hover:text-primary font-bold transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary font-bold transition-colors">Security</a>
          <a href="#" className="hover:text-primary font-bold transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
