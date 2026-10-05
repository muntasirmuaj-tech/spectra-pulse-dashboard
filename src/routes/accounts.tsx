import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Info, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PlatformBadge } from "@/components/dashboard/PlatformBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePulse } from "@/lib/pulse-store";
import { platformMeta, type Platform, formatNumber } from "@/lib/social-data";
import { pulsePersistenceMode } from "@/lib/pulse-api";

export const Route = createFileRoute("/accounts")({ component: AccountsPage });
const platforms: Platform[] = ["facebook", "instagram", "whatsapp", "tiktok"];

function AccountsPage() {
  const { accounts, addAccount, toggleAccount, removeAccount } = usePulse();
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");

  function add() {
    if (!name.trim() || !handle.trim()) return;
    if (accounts.some((account) => account.platform === platform && account.handle.toLowerCase() === handle.trim().toLowerCase())) {
      toast.error("That account is already in this workspace");
      return;
    }
    addAccount({ platform, name: name.trim(), handle: handle.trim(), followers: 0, connected: false });
    setName(""); setHandle(""); setShowForm(false);
    toast.success("Account added", { description: "It is now available across Pulse." });
  }

  return (
    <DashboardLayout title="Accounts" subtitle="Manage as many social accounts as you need.">
      <div className="panel mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex gap-3">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">Account-scoped workspace</p>
            <p className="mt-1 text-sm text-muted-foreground">{pulsePersistenceMode === "api" ? "Workspace data is managed by your server. Social network sign-in and publishing require platform integrations." : "Accounts and schedules are stored in this browser. Social network sign-in and publishing require platform integrations."}</p>
          </div>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}><Plus className="mr-1.5 h-4 w-4" /> Add account</Button>
      </div>

      {showForm && (
        <div className="panel mb-6 grid gap-4 p-5 md:grid-cols-4">
          <div><Label>Platform</Label><select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{platforms.map((p) => <option key={p} value={p}>{platformMeta[p].label}</option>)}</select></div>
          <div><Label htmlFor="account-name">Account name</Label><Input id="account-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Brand account" className="mt-1.5" /></div>
          <div><Label htmlFor="account-handle">Handle / number</Label><Input id="account-handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@brand" className="mt-1.5" /></div>
          <div className="flex items-end"><Button className="w-full" onClick={add} disabled={!name.trim() || !handle.trim()}>Save account</Button></div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((a) => (
          <div key={a.id} className="panel flex flex-col p-5">
            <div className="flex items-center justify-between"><PlatformBadge platform={a.platform} /><button className="text-muted-foreground hover:text-destructive" onClick={() => removeAccount(a.id)} aria-label={`Remove ${a.name}`}><Trash2 className="h-4 w-4" /></button></div>
            <p className="mt-3 text-base font-semibold">{a.name}</p><p className="text-sm text-muted-foreground">{a.handle}</p>
            <p className="mt-4 text-sm"><span className="stat-figure block">{formatNumber(a.followers)}</span><span className="text-muted-foreground">audience</span></p>
            <div className="mt-5 flex items-center gap-2">
              {a.connected ? <><span className="flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="h-4 w-4" /> Enabled in workspace</span><Button size="sm" variant="ghost" className="ml-auto" onClick={() => toggleAccount(a.id)}>Disable</Button></> : <Button className="w-full" variant="secondary" onClick={() => { toggleAccount(a.id); toast.success("Account enabled for scheduling"); }}>Enable for workspace</Button>}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
