"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Check,
  ArrowUpRight,
  ListTodo,
  Wallet,
  FolderClock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { money } from "@/features/invoices/billing";
import type { TodayData } from "../today";
import type { Followup } from "@/types/followup";
export function TodayView({
  data,
  timeZone,
  preview = false,
}: {
  data: TodayData;
  timeZone: string;
  preview?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [reschedule, setReschedule] = useState<Followup | null>(null);
  const [date, setDate] = useState("");
  useEffect(() => {
    if (preview) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 60000);
    return () => clearInterval(t);
  }, [preview, router]);
  async function update(id: string, changes: object) {
    if (preview) {
      setError(
        "Sample preview only. Open Today after the database update to save changes.",
      );
      return;
    }
    setBusy(id);
    setError("");
    const { error } = await createClient()
      .from("lead_followups")
      .update(changes)
      .eq("id", id);
    if (error) setError(error.message);
    else {
      setReschedule(null);
      router.refresh();
      window.dispatchEvent(new Event("crm-notifications-changed"));
    }
    setBusy(null);
  }
  function reminder(f: Followup) {
    return (
      <div key={f.id} className="rounded-xl border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {f.leads?.full_name ?? "Lead"}
            </p>
            <p className="mt-1 text-sm text-slate break-words">{f.action}</p>
            <p
              className={`mt-2 text-xs ${f.due_at < new Date().toISOString() ? "text-danger" : "text-muted"}`}
            >
              {new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone,
              }).format(new Date(f.due_at))}
            </p>
          </div>
          <CalendarClock className="h-4 w-4 shrink-0 text-muted" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={busy === f.id}
            onClick={() => update(f.id, { status: "done" })}
          >
            <Check className="h-3.5 w-3.5" />
            Done
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDate("");
              setReschedule(f);
            }}
          >
            Reschedule
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy === f.id}
            onClick={() => update(f.id, { status: "cancelled" })}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }
  const metrics = [
    {
      label: "Follow-ups today",
      value: data.dueFollowups.length,
      icon: CalendarClock,
    },
    { label: "Tasks due", value: data.tasks.length, icon: ListTodo },
    {
      label: "Project deadlines",
      value: data.projects.length,
      icon: FolderClock,
    },
    { label: "Pending payments", value: money(data.outstanding), icon: Wallet },
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your daily workspace"
        title="Today"
        description={`Start with what needs your attention · ${data.today} · ${timeZone}`}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-4 sm:p-5">
            <m.icon className="h-5 w-5 text-signal" />
            <p className="mt-4 text-2xl font-semibold tracking-tight">
              {m.value}
            </p>
            <p className="mt-1 text-xs text-slate">{m.label}</p>
          </Card>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Follow-ups & overdue</h2>
              <Link href="/leads" className="text-xs text-signal">
                Manage leads <ArrowUpRight className="inline h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {data.dueFollowups.length ? (
                data.dueFollowups.map(reminder)
              ) : (
                <Empty text="No follow-ups due. Add your next action from Leads." />
              )}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-base font-semibold">
              Upcoming follow-ups
            </h2>
            <div className="space-y-3">
              {data.upcomingFollowups.length ? (
                data.upcomingFollowups.map(reminder)
              ) : (
                <Empty text="No upcoming reminders." />
              )}
            </div>
          </section>
        </div>
        <div className="space-y-5">
          <section>
            <h2 className="mb-3 text-base font-semibold">Tasks due</h2>
            <Card className="divide-y divide-line px-4">
              {data.tasks.length ? (
                data.tasks.map((t) => (
                  <Row
                    key={t.id}
                    title={t.title}
                    detail={`${t.projects?.title ?? "Project"} · ${t.due_date}`}
                    href={`/projects/${t.project_id}`}
                  />
                ))
              ) : (
                <Empty text="No overdue or today's tasks. Includes your tasks and unassigned team tasks." />
              )}
            </Card>
          </section>
          <section>
            <h2 className="mb-3 text-base font-semibold">Project deadlines</h2>
            <Card className="divide-y divide-line px-4">
              {data.projects.length ? (
                data.projects.map((p) => (
                  <Row
                    key={p.id}
                    title={p.title}
                    detail={`Due ${p.due_date}`}
                    href={`/projects/${p.id}`}
                  />
                ))
              ) : (
                <Empty text="No active project deadlines due." />
              )}
            </Card>
          </section>
          <section>
            <h2 className="mb-3 text-base font-semibold">Pending payments</h2>
            <Card className="divide-y divide-line px-4">
              {data.invoices.length ? (
                data.invoices.map((i) => (
                  <Row
                    key={i.id}
                    title={i.invoice_number}
                    detail={`${money(i.balance)} remaining · ${i.due_date ? `Due ${i.due_date}` : "No due date"}`}
                    href={`/projects/${i.project_id}`}
                  />
                ))
              ) : (
                <Empty text="No outstanding issued invoices." />
              )}
            </Card>
            <p className="mt-2 text-xs text-muted">
              Agency-wide balances use recorded payments. Draft invoices are
              excluded.
            </p>
          </section>
        </div>
      </div>
      <Dialog
        open={reschedule !== null}
        onClose={() => {
          if (!busy) setReschedule(null);
        }}
        title="Reschedule follow-up"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (reschedule && date)
              void update(reschedule.id, {
                due_at: new Date(date).toISOString(),
              });
          }}
        >
          <Input
            label="New reminder time"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            helperText="Uses your device’s time zone."
          />
          <Button type="submit" loading={busy !== null}>
            Save reminder
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-line p-5 text-sm leading-6 text-slate">
      {text}
    </p>
  );
}
function Row({
  title,
  detail,
  href,
}: {
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 py-4 hover:text-signal"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium break-words">{title}</p>
        <p className="mt-1 text-xs text-slate">{detail}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" />
    </Link>
  );
}
