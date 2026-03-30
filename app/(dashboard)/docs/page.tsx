"use client";

export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8 px-4">
      <section className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Flowlog Documentation</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Flowlog is a daily work tracker for developers, freelancers, and team leads who manage multiple clients. It helps you plan your day, log your work by client, and keep a permanent history of everything you build.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight border-b pb-2">How to Access Help</h2>
        <p className="text-muted-foreground leading-relaxed">
          You can open this guide at any time by clicking the <strong className="text-foreground">documentation</strong> icon in the top header. It sits right next to your profile avatar and the dark mode toggle.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight border-b pb-2">Quick Start</h2>
        <ol className="list-decimal list-outside ml-5 space-y-2 text-muted-foreground font-medium">
          <li>Sign up and open the Daily page.</li>
          <li>Click the task input box at the top.</li>
          <li>Type &quot;Build a landing page for Acme Corp&quot;.</li>
          <li>Press Enter to save the task.</li>
          <li>Click the circle beside the task when you finish.</li>
        </ol>
      </section>

      {/* DAILY WORKSPACE */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Daily Workspace</h2>
        
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-primary">Start of Day</h3>
          <p className="text-muted-foreground">
            What is this? <strong className="text-foreground">Start of Day</strong> (SOD) is where you plan what you want to achieve today. You write your tasks here in plain English.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Click the task input at the top of the page.</li>
              <li>Type what you need to do.</li>
              <li>Press Enter to add it to your list.</li>
              <li>Drag tasks up or down to change their order.</li>
              <li>Click the circle checkbox to finish a task.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You want to work on a specific fix. You type &quot;Review pull requests for Abhishek&quot; and press Enter. The task drops into your list ready for you to start working.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: Flowlog has a smart parser so you rarely need to tag items manually.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> When you complete a task, Flowlog moves it directly into your End of Day log.
          </p>
        </div>

        <div className="space-y-4 border-t pt-6 border-dashed border-border/50">
          <h3 className="text-xl font-bold text-primary">Smart Parser</h3>
          <p className="text-muted-foreground">
            What is this? The <strong className="text-foreground">smart parser</strong> runs silently when you type a task. It automatically links your task to your correct client or project without any special symbols.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Type your task using normal words.</li>
              <li>Include words that match your client or project name.</li>
              <li>Do not type hashtags or symbols unless you want to.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You type &quot;Fix the login bug for ConnectHub App&quot;. Flowlog scans your text against your existing clients. It uses a scoring model to match &quot;ConnectHub App&quot; to the project and automatically assigns the task to the client <strong className="text-foreground">Abhishek</strong>. No extra input is needed.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: You can optionally override the parser using <code className="bg-muted px-1.5 py-0.5 rounded text-sm not-italic">@ClientName</code>, <code className="bg-muted px-1.5 py-0.5 rounded text-sm not-italic">#ProjectName</code>, and <code className="bg-muted px-1.5 py-0.5 rounded text-sm not-italic">!priority</code> syntax.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> Your typed task is linked to the correct client and saved in their activity history.
          </p>
        </div>

        <div className="space-y-4 border-t pt-6 border-dashed border-border/50">
          <h3 className="text-xl font-bold text-primary">End of Day</h3>
          <p className="text-muted-foreground">
            What is this? <strong className="text-foreground">End of Day</strong> (EOD) is your automatic work diary. It lists everything you finished today.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Finish tasks in your Start of Day list.</li>
              <li>Open the End of Day tab.</li>
              <li>Read the exact time you finished each item.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You click the circle checkbox on &quot;Write website copy for Acme Corp&quot;. Flowlog moves the task to the End of Day list. It adds a 3:15 PM timestamp. It visibly tags Acme Corp next to the completed item.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: You never type directly into the End of Day list because it builds itself automatically.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> These completed tasks become a permanent part of your personal Timeline and the client&apos;s activity history.
          </p>
        </div>

        <div className="space-y-4 border-t pt-6 border-dashed border-border/50">
          <h3 className="text-xl font-bold text-primary">The Midnight Rollover</h3>
          <p className="text-muted-foreground">
            What is this? Flowlog moves your unfinished tasks to the next day automatically via a <strong className="text-foreground">midnight rollover</strong>. A background system moves the items at exactly 12:00 AM midnight so you never repeat old work yourself.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Leave any unfinished tasks in today&apos;s list.</li>
              <li>Stop working and close Flowlog.</li>
              <li>Open Flowlog tomorrow morning to see them ready.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You leave &quot;Test the Stripe integration for Abhishek&quot; unfinished on Tuesday. At exactly 12:00 AM, Flowlog pushes this task to Wednesday. You wake up, open Flowlog, and see it waiting for you in your new list.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: Tasks keep rolling over every single midnight until you finally finish or delete them.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> Unfinished tasks wait in tomorrow&apos;s Start of Day list so you can try again.
          </p>
        </div>

        <div className="space-y-4 border-t pt-6 border-dashed border-border/50">
          <h3 className="text-xl font-bold text-primary">Pick Date</h3>
          <p className="text-muted-foreground">
            What is this? <strong className="text-foreground">Pick Date</strong> lets you look back in time to review your past work on any exact day.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Click the Pick Date button in the top right.</li>
              <li>Choose a specific date from the calendar view.</li>
              <li>Read what you planned and finished on that day.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">A client asks what you did last Tuesday. You click Pick Date and select last Tuesday on the calendar. You review your past view and see exactly what tasks you finished.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: Past dates are read-only so you cannot edit or add tasks in the past.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> Information you read here helps you answer questions or write status reports.
          </p>
        </div>
      </section>

      {/* CLIENT PROJECTS */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Client Projects</h2>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-primary">Creating Clients and Projects</h3>
          <p className="text-muted-foreground">
            What is this? A <strong className="text-foreground">client</strong> is a company or person you do work for. Each client contains specific <strong className="text-foreground">projects</strong> that you divide their work into.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Open Client Projects from the left sidebar.</li>
              <li>Click New Client and enter their name.</li>
              <li>Open your new client.</li>
              <li>Click New Project and enter the project name.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You click New Client and type &quot;Abhishek&quot;. You open the client page and click New Project. You type &quot;Mobile App&quot;. Now you have a specific project to organize all work for Abhishek&apos;s app.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: You are recorded as the owner of any client you create.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> Your new client and project become available for the smart parser to detect when you type tasks.
          </p>
        </div>

        <div className="space-y-4 border-t pt-6 border-dashed border-border/50">
          <h3 className="text-xl font-bold text-primary">Inviting Team Members</h3>
          <p className="text-muted-foreground">
            What is this? You can <strong className="text-foreground">invite</strong> other people into a client workspace so they can track their work together with you.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Open the specific client you want to share.</li>
              <li>Click the Invite button.</li>
              <li>Type the person&apos;s email address.</li>
              <li>Send the invitation.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You invite your designer &quot;sarah@example.com&quot; to the &quot;Acme Corp&quot; client workspace. She receives an invitation email. Once she accepts, she sees Acme Corp in her sidebar and can log tasks.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: You can invite someone at the client level and they will see all projects inside that client.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> Your team members log their work, and their finished items show up in the shared client history.
          </p>
        </div>
      </section>

      {/* PERSONAL PROJECTS */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Personal Projects</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            What is this? <strong className="text-foreground">Personal Projects</strong> belong to you entirely and do not connect to any external client.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Open Projects in the left sidebar.</li>
              <li>Click New Project.</li>
              <li>Enter a name.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You create a project called &quot;Personal Portfolio&quot;. When you log tasks to build your portfolio, they stay separated from your paid client work.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: Since there is no client attached, there are no team invites available here.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> Tasks tagged with a personal project fill up that project&apos;s specific timeline.
          </p>
        </div>
      </section>

      {/* MEETINGS */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Meetings</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            What is this? <strong className="text-foreground">Meetings</strong> lets you schedule upcoming calls and receive an email reminder before they start.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Open Meetings in the sidebar.</li>
              <li>Click New Meeting.</li>
              <li>Type the meeting title and pick the time.</li>
              <li>Select a reminder timing option.</li>
              <li>Click Save.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You create &quot;Sprint planning with Abhishek&quot;. You pick a 15-minute reminder. At exactly 15 minutes before the meeting, Flowlog checks the schedule. It sends an email to you containing the time, client, and any notes you added.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: In a future update, Flowlog will automatically import meeting transcripts from Google Meet to extract action items.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> The reminder email is sent to your registered email address exactly once.
          </p>
        </div>
      </section>

      {/* CLIENT UPDATES */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Client Updates</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            What is this? <strong className="text-foreground">Client Updates</strong> is a running document log for each client where you record accomplishments and upcoming work.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Select a client from the sidebar.</li>
              <li>Click New Update.</li>
              <li>Fill in what you did.</li>
              <li>Fill in what is next.</li>
              <li>Click Save.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You select &quot;Acme Corp&quot; and click New Update. You type &quot;Finished the database migration&quot; under completed work. You type &quot;Starting the payment gateway&quot; under upcoming work. You save it just before hopping on your weekly status call.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: The update is timestamped so you can see a chronological history for every client.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> You keep a perfect history of updates that helps you instantly answer what you have been doing.
          </p>
        </div>
      </section>

      {/* INBOX */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Inbox</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            What is this? The <strong className="text-foreground">Inbox</strong> is a quick capture zone for dumping ideas before you are ready to schedule them.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Click Inbox in the left sidebar.</li>
              <li>Type an idea.</li>
              <li>Press Enter to save it.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You are coding when you suddenly remember you need to buy server space. You drop &quot;buy server&quot; in the Inbox so you do not forget. Later, you convert it into a task.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: The sidebar shows a notification count so you always know how many unprocessed items remain.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> When you convert an Inbox item into a task, it moves into today&apos;s Start of Day log.
          </p>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Timeline</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            What is this? The <strong className="text-foreground">Timeline</strong> is a complete history of every task you have completed across all clients and projects.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Click Timeline in the sidebar.</li>
              <li>Scroll through your recent work history.</li>
              <li>Apply filters to narrow by client or project.</li>
              <li>Filter by specific date ranges.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You want to invoice &quot;Abhishek&quot; for last month. You open your Timeline. You apply the Abhishek client filter and set the date to last month. You instantly see every task you finished for him, the exact time it was completed, and the day log it belonged to.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: Performance reviews and invoices become very easy when you never have to remember your past work manually.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> Flowlog saves everything permanently so your professional record stays intact forever.
          </p>
        </div>
      </section>

      {/* SETTINGS & DARK MODE */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Settings & Dark Mode</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            What is this? <strong className="text-foreground">Settings</strong> is where you control your account preferences and switch your display theme.
          </p>
          <div className="text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">How to use it:</p>
            <ol className="list-decimal list-outside ml-5 space-y-1 font-medium">
              <li>Click Settings from the sidebar.</li>
              <li>Change your display name or profile avatar.</li>
              <li>Click the sun or moon icon in the top header.</li>
            </ol>
          </div>
          <div className="text-muted-foreground">
            <p className="font-semibold text-foreground">A real example:</p>
            <p className="font-medium">You work late at night and prefer a darker screen. You click the moon icon at the top of the window. Flowlog instantly changes to <strong className="text-foreground">dark mode</strong>.</p>
          </div>
          <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground bg-muted/20 py-2 rounded-r-lg font-medium">
            Good to know: You can use the top right header icon to toggle your theme on any page.
          </blockquote>
          <p className="text-muted-foreground font-medium">
            <strong className="text-foreground">What happens next:</strong> Your theme preference is saved and applied automatically on your next visit.
          </p>
        </div>
      </section>

      {/* TIPS & SHORTCUTS */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight border-b pb-2">Tips & Shortcuts</h2>
        <ul className="list-disc list-outside ml-5 space-y-3 text-muted-foreground leading-relaxed font-medium">
          <li><strong className="text-foreground">Write simply:</strong> Just type what you want to do. The smart parser figures out the client and project.</li>
          <li><strong className="text-foreground">Drag tasks:</strong> Click and hold any task in the Daily workspace to move it up or down your list.</li>
          <li><strong className="text-foreground">Use the syntax:</strong> Type <code className="bg-muted px-1.5 py-0.5 rounded text-sm break-keep not-italic">@Acme Corp</code> or <code className="bg-muted px-1.5 py-0.5 rounded text-sm break-keep not-italic">#Website Redesign</code> or <code className="bg-muted px-1.5 py-0.5 rounded text-sm not-italic">!high</code> if you prefer manual entry.</li>
          <li><strong className="text-foreground">Stay out of the past:</strong> You never need to copy unfinished tasks manually. The midnight rollover handles it.</li>
          <li><strong className="text-foreground">Use the header toggle:</strong> Swap light mode and dark mode from any page using the top right icon.</li>
          <li><strong className="text-foreground">Access help anywhere:</strong> Click the documentation icon next to your avatar to read these steps again.</li>
        </ul>
      </section>

    </div>
  );
}
