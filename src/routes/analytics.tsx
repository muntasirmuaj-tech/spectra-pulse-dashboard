import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { usePulse } from "@/lib/pulse-store";
import {
  engagementSeries,
  formatNumber,
  platformMeta,
  reachSeries,
} from "@/lib/social-data";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Social analytics — Pulse" },
      {
        name: "description",
        content:
          "Compare reach, engagement and audience split across Facebook, Instagram and WhatsApp week over week.",
      },
      { property: "og:title", content: "Social analytics — Pulse" },
      {
        property: "og:description",
        content: "Reach, engagement and audience share for all your connected accounts.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-popover)",
  color: "var(--color-popover-foreground)",
};

function AnalyticsPage() {
  const { accounts, activeAccountId } = usePulse();
  const scopedAccounts = activeAccountId === "all" ? accounts : accounts.filter((a) => a.id === activeAccountId);
  const audience = scopedAccounts.map((a) => ({
    name: platformMeta[a.platform].label,
    value: a.followers,
    platform: a.platform,
  }));
  const colors: Record<string, string> = {
    facebook: "var(--color-chart-2)",
    instagram: "var(--color-chart-3)",
    whatsapp: "var(--color-chart-4)",
    tiktok: "var(--color-tiktok)",
  };

  return (
    <DashboardLayout
      title="Analytics"
      subtitle="Live analytics become available after platform integrations are configured."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Daily reach</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reachSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                <Bar dataKey="facebook" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="instagram" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="whatsapp" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tiktok" fill="var(--color-tiktok)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold">Audience split</h2>
          <div className="mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={audience}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {audience.map((a) => (
                    <Cell key={a.platform} fill={colors[a.platform]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-2">
            {audience.map((a) => (
              <li key={a.platform} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: colors[a.platform] }}
                  />
                  {a.name}
                </span>
                <span className="font-medium">{formatNumber(a.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel mt-6 p-5">
        <h2 className="text-base font-semibold">Engagement trend</h2>
        <p className="text-sm text-muted-foreground">Comments, reactions and replies combined</p>
        <div className="mt-5 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={engagementSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-chart-1)"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
