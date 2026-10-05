import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarClock,
  Inbox,
  LayoutDashboard,
  Plug,
  Search,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePulse } from "@/lib/pulse-store";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/scheduler", label: "Scheduler", icon: CalendarClock },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/accounts", label: "Accounts", icon: Plug },
] as const;

export function DashboardLayout({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { accounts, activeAccountId, setActiveAccountId, syncError, retrySync, workspaceReady, hydrated } = usePulse();

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Ambient lime glows */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <aside className="sticky top-0 z-10 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/80 px-4 py-6 backdrop-blur md:flex">
        <div className="flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)] animate-glow-pulse">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold text-gradient-lime">Pulse</span>
        </div>

        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_oklch(0.87_0.28_128/0.35),0_0_16px_oklch(0.87_0.28_128/0.15)]"
                    : "text-muted-foreground hover:translate-x-0.5 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-border bg-muted/50 p-4">
          <p className="text-sm font-medium">{accounts.length ? `${accounts.length} workspace account${accounts.length === 1 ? "" : "s"}` : "No accounts added"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Social sign-in and live data require platform integrations.
          </p>
          <Button asChild size="sm" className="mt-3 w-full">
            <Link to="/accounts">Link accounts</Link>
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
          <div className="flex flex-wrap items-center gap-4 px-6 py-5">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-semibold">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="relative hidden lg:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search everything" className="w-64 pl-9" />
            </div>
            <select
              aria-label="Active account scope"
              value={activeAccountId}
              onChange={(e) => setActiveAccountId(e.target.value)}
              className="hidden h-10 max-w-52 rounded-md border border-input bg-background px-3 text-sm lg:block"
            >
              <option value="all">All accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {account.handle}
                </option>
              ))}
            </select>
            {action}
          </div>
          <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden">
            {nav.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {syncError && <div role="alert" className="mx-6 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <span>{syncError}</span>
          <Button size="sm" variant="outline" onClick={retrySync}>Retry sync</Button>
        </div>}
        <main key={pathname} className="relative z-0 flex-1 px-6 py-6 animate-fade-up">
          {!workspaceReady ? <div role="status" className="panel p-6 text-sm text-muted-foreground">{hydrated ? "The workspace server is unavailable. Retry the connection to continue." : "Loading your workspace…"}</div> : children}
        </main>
      </div>
    </div>
  );
}
