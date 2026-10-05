import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CalendarClock,
  Inbox,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { usePulse } from "@/lib/pulse-store";
import { PlatformBadge } from "@/components/dashboard/PlatformBadge";
import { Button } from "@/components/ui/button";
import {
  formatNumber,
  reachSeries,
} from "@/lib/social-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — Facebook, Instagram & WhatsApp in one dashboard" },
      {
        name: "description",
        content:
          "Pulse brings your Facebook, Instagram and WhatsApp messages, scheduled posts and performance into a single clean dashboard.",
      },
      {
        property: "og:title",
        content: "Pulse — Facebook, Instagram & WhatsApp in one dashboard",
      },
      {
        property: "og:description",
        content:
          "One place for your unified inbox, cross-platform post scheduler and social analytics.",
      },
    ],
  }),
  component: Overview,
});

function Stat({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="panel card-hover p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="stat-figure mt-4 text-gradient-lime">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-success">
        <ArrowUpRight className="h-3 w-3" />
        {delta}
      </p>
    </div>
  );
}

function Overview() {
  const { accounts, conversations, scheduledPosts, activeAccountId } = usePulse();
  const scopedAccounts = activeAccountId === "all" ? accounts : accounts.filter((a) => a.id === activeAccountId);
  const scopedIds = new Set(scopedAccounts.map((a) => a.id));
  const scopedConversations = conversations.filter((c) => scopedIds.has(c.accountId));
  const scopedPosts = scheduledPosts.filter((p) => p.accountIds.some((id) => scopedIds.has(id)));
  const followers = scopedAccounts.reduce((sum, a) => sum + a.followers, 0);
  const unread = scopedConversations.filter((c) => c.unread).length;
  const upcoming = scopedPosts.filter((p) => p.status === "scheduled").length;

  return (
    <DashboardLayout
      title="Overview"
      subtitle="Everything happening across your pages today."
      action={
        <Button asChild>
          <Link to="/scheduler">New post</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 [&>*]:animate-fade-up [&>*:nth-child(2)]:[animation-delay:80ms] [&>*:nth-child(3)]:[animation-delay:160ms] [&>*:nth-child(4)]:[animation-delay:240ms]">
        <Stat
          icon={Users}
          label="Total audience"
          value={formatNumber(followers)}
          delta="4.2% this week"
        />
        <Stat
          icon={MessageSquare}
          label="Unread messages"
          value={String(unread)}
          delta="Replies under 2h"
        />
        <Stat
          icon={CalendarClock}
          label="Scheduled posts"
          value={String(upcoming)}
          delta="Next in 14 hours"
        />
        <Stat
          icon={TrendingUp}
          label="Weekly reach"
          value="—"
          delta="Live metrics require an integration"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Reach by platform</h2>
              <p className="text-sm text-muted-foreground">Live metrics require a platform integration</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/analytics">Details</Link>
            </Button>
          </div>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reachSeries}>
                <defs>
                  {(
                    [
                      ["facebook", "var(--color-chart-2)"],
                      ["instagram", "var(--color-chart-3)"],
                      ["whatsapp", "var(--color-chart-4)"],
                      ["tiktok", "var(--color-tiktok)"],
                    ] as const
                  ).map(([k, c]) => (
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={c} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke="var(--color-muted-foreground)"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-popover)",
                    color: "var(--color-popover-foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="instagram"
                  stroke="var(--color-chart-3)"
                  fill="url(#g-instagram)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="facebook"
                  stroke="var(--color-chart-2)"
                  fill="url(#g-facebook)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="whatsapp"
                  stroke="var(--color-chart-4)"
                  fill="url(#g-whatsapp)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="tiktok"
                  stroke="var(--color-tiktok)"
                  fill="url(#g-tiktok)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Latest messages</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/inbox">
                <Inbox className="mr-1 h-4 w-4" />
                Inbox
              </Link>
            </Button>
          </div>
          <ul className="mt-4 space-y-4">
            {scopedConversations.slice(0, 4).map((c) => (
              <li key={c.id} className="flex gap-3">
                <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {c.person
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{c.person}</p>
                    <span className="text-xs text-muted-foreground">{c.time}</span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{c.preview}</p>
                  <PlatformBadge platform={c.platform} className="mt-1.5" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel mt-6 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Coming up</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/scheduler">Open scheduler</Link>
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {scopedPosts.slice(0, 3).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-28 shrink-0 text-sm font-medium">{p.date}</span>
              <span className="w-14 shrink-0 text-sm text-muted-foreground">{p.time}</span>
              <p className="min-w-0 flex-1 truncate text-sm">{p.body}</p>
              <div className="flex gap-1.5">
                {p.platforms.map((pl) => (
                  <PlatformBadge key={pl} platform={pl} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
}
