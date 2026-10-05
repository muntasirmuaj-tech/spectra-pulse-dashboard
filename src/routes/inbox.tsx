import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PlatformBadge } from "@/components/dashboard/PlatformBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePulse } from "@/lib/pulse-store";
import { platformMeta, type Platform } from "@/lib/social-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inbox")({ component: InboxPage });
const filters: ("all" | Platform)[] = ["all", "facebook", "instagram", "whatsapp", "tiktok"];

function InboxPage() {
  const { accounts, conversations, addReply, markConversationRead, activeAccountId } = usePulse();
  const [filter, setFilter] = useState<"all" | Platform>("all");
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const list = conversations.filter((c) =>
    (filter === "all" || c.platform === filter) &&
    (activeAccountId === "all" || c.accountId === activeAccountId),
  );
  const active = conversations.find((c) => c.id === activeId) ?? list[0];
  const activeAccount = active ? accounts.find((a) => a.id === active.accountId) : undefined;

  useEffect(() => {
    if (active?.unread) markConversationRead(active.id);
  }, [active?.id, active?.unread, markConversationRead]);

  function openConversation(id: string) {
    setActiveId(id);
    markConversationRead(id);
  }

  function send() {
    if (!active || !draft.trim()) return;
    addReply(active.id, draft.trim()); setDraft(""); toast.success("Reply saved to workspace");
  }

  return <DashboardLayout title="Inbox" subtitle="Replies are saved in this workspace. Sending requires platform integrations.">
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]"><div className="panel flex flex-col overflow-hidden"><div className="flex gap-1.5 overflow-x-auto border-b border-border p-3">{filters.map((f) => <button key={f} onClick={() => setFilter(f)} className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium", filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{f === "all" ? "All" : platformMeta[f].label}</button>)}</div><ul className="divide-y divide-border">{list.map((c) => { const account = accounts.find((a) => a.id === c.accountId); return <li key={c.id}><button onClick={() => openConversation(c.id)} className={cn("w-full px-4 py-3 text-left hover:bg-muted/60", active?.id === c.id && "bg-accent/50")}><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium">{c.person}</p><span className="shrink-0 text-xs text-muted-foreground">{c.time}</span></div><p className="mt-0.5 truncate text-sm text-muted-foreground">{c.preview}</p><div className="mt-2 flex items-center gap-2"><PlatformBadge platform={c.platform} />{account && <span className="truncate text-[11px] text-muted-foreground">{account.name}</span>}{c.unread && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">Unread</span>}</div></button></li>})}</ul></div>
      <div className="panel flex min-h-[32rem] flex-col">{active ? <><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="font-medium">{active.person}</p><p className="text-sm text-muted-foreground">{activeAccount?.name ?? "Unknown account"}</p></div><PlatformBadge platform={active.platform} /></div><div className="flex-1 space-y-3 p-5">{active.messages.map((m, i) => <div key={i} className={cn("flex", m.from === "us" ? "justify-end" : "justify-start")}><div className={cn("max-w-[75%] rounded-2xl px-4 py-2.5 text-sm", m.from === "us" ? "bg-primary text-primary-foreground" : "bg-muted")}><p>{m.body}</p><p className="mt-1 text-[11px] opacity-70">{m.time}</p></div></div>)}</div><div className="border-t border-border p-4"><Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Reply on ${platformMeta[active.platform].label}…`} rows={3} /><div className="mt-3 flex items-center justify-end"><Button onClick={send} disabled={!draft.trim()}><Send className="mr-1.5 h-4 w-4" />Save reply</Button></div></div></> : <p className="m-auto text-sm text-muted-foreground">No conversations here.</p>}</div></div>
  </DashboardLayout>;
}
