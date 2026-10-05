import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PlatformBadge } from "@/components/dashboard/PlatformBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePulse } from "@/lib/pulse-store";
import { platformMeta, type Platform } from "@/lib/social-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scheduler")({ component: SchedulerPage });

function SchedulerPage() {
  const { accounts, scheduledPosts, addScheduledPost, removeScheduledPost, activeAccountId } = usePulse();
  const [selected, setSelected] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const connected = accounts.filter((a) => a.connected && (activeAccountId === "all" || a.id === activeAccountId));
  const visiblePosts = scheduledPosts.filter((post) => activeAccountId === "all" || post.accountIds.includes(activeAccountId));
  const selectedAccounts = useMemo(() => accounts.filter((a) => selected.includes(a.id)), [accounts, selected]);

  function schedule() {
    if (!body.trim() || selected.length === 0 || !date || !time) return;
    const scheduledAt = new Date(`${date}T${time}`);
    if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      toast.error("Choose a date and time in the future");
      return;
    }
    addScheduledPost({ accountIds: selected, platforms: [...new Set(selectedAccounts.map((a) => a.platform))] as Platform[], body: body.trim(), date, time, status: "scheduled" });
    setBody(""); setSelected([]);
    toast.success("Post scheduled", { description: `Queued for ${selectedAccounts.length} account${selectedAccounts.length === 1 ? "" : "s"}.` });
  }

  return <DashboardLayout title="Scheduler" subtitle="Queue posts for workspace accounts. Publishing requires platform integrations.">
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="panel p-5">
        <div className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" /><h2 className="font-semibold">Queue</h2></div>
        <ul className="mt-4 divide-y divide-border">{[...visiblePosts].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)).map((p) => <li key={p.id} className="py-4 first:pt-0"><div className="flex items-center justify-between gap-3"><div className="flex flex-wrap gap-1.5">{p.accountIds.map((id) => { const a = accounts.find((x) => x.id === id); return a ? <PlatformBadge key={id} platform={a.platform} /> : null; })}</div><div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">{p.date} · {p.time}</span><button aria-label={`Remove post: ${p.body.slice(0, 30)}`} className="text-muted-foreground hover:text-destructive" onClick={() => removeScheduledPost(p.id)}><Trash2 className="h-4 w-4" /></button></div></div><p className="mt-2 text-sm">{p.body}</p><span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{p.status}</span></li>)}</ul>
      </div>
      <div className="panel h-fit p-5"><h2 className="text-base font-semibold">Compose</h2>
        <div className="mt-4 space-y-4">
          <div><Label>Target accounts</Label><div className="mt-2 space-y-2">{connected.length ? connected.map((a) => <button key={a.id} onClick={() => setSelected((v) => v.includes(a.id) ? v.filter((id) => id !== a.id) : [...v, a.id])} className={cn("flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm", selected.includes(a.id) ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50")}><span>{a.name}</span><PlatformBadge platform={a.platform} /></button>) : <p className="text-sm text-muted-foreground">Enable a workspace account first.</p>}</div></div>
          <div><Label htmlFor="body">Message</Label><Textarea id="body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What do you want to share?" className="mt-1.5" /><p className="mt-1 text-xs text-muted-foreground">{body.length} characters</p></div>
          <div className="grid grid-cols-2 gap-3"><div><Label htmlFor="date">Date</Label><Input id="date" type="date" min={new Date().toLocaleDateString("en-CA")} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" /></div><div><Label htmlFor="time">Time</Label><Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1.5" /></div></div>
          <Button className="w-full" onClick={schedule} disabled={!body.trim() || !selected.length || !date || !time}>Add to queue</Button>
        </div>
      </div>
    </div>
  </DashboardLayout>;
}
