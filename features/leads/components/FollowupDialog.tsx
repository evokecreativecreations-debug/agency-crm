"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/types/lead";
import type { Followup } from "@/types/followup";
export function FollowupDialog({
  lead,
  onClose,
  onContacted,
}: {
  lead: Lead | null;
  onClose: () => void;
  onContacted: (id: string, at: string) => void;
}) {
  return lead ? (
    <FollowupForm key={lead.id} lead={lead} onClose={onClose} onContacted={onContacted} />
  ) : null;
}
function FollowupForm({ lead, onClose, onContacted }: { lead: Lead; onClose: () => void; onContacted: (id: string, at: string) => void }) {
  const router = useRouter();
  const [action, setAction] = useState("");
  const [due, setDue] = useState("");
  const [items, setItems] = useState<Followup[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    void createClient()
      .from("lead_followups")
      .select("*")
      .eq("lead_id", lead.id)
      .eq("status", "pending")
      .order("due_at")
      .then(({ data, error }) => {
        if (active) {
          setItems(data ?? []);
          setLoading(false);
          if (error) setError("Follow-ups need the latest database update.");
        }
      });
    return () => {
      active = false;
    };
  }, [lead.id]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!action.trim() || !due || !Number.isFinite(new Date(due).getTime())) {
      setError("Add a next action and valid reminder date.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await createClient()
        .from("lead_followups")
        .insert({
          lead_id: lead.id,
          action: action.trim(),
          due_at: new Date(due).toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      setItems((prev) =>
        [...prev, data].sort((a, b) => a.due_at.localeCompare(b.due_at)),
      );
      setAction("");
      setDue("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save follow-up.");
    } finally {
      setBusy(false);
    }
  }
  async function finish(id: string, status: "done" | "cancelled") {
    setBusy(true);
    setError("");
    const { error } = await createClient()
      .from("lead_followups")
      .update({ status })
      .eq("id", id);
    if (error) setError(error.message);
    else {
      setItems((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    }
    setBusy(false);
  }
  async function contacted() {
    const at = new Date().toISOString();
    setBusy(true);
    setError("");
    const { error } = await createClient()
      .from("leads")
      .update({ last_contacted_at: at })
      .eq("id", lead.id);
    if (error) setError(error.message);
    else {
      onContacted(lead.id, at);
      router.refresh();
      onClose();
    }
    setBusy(false);
  }
  return (
    <Dialog
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      title={`Follow up · ${lead.full_name}`}
      description="Your personal next actions. Dates use this device’s time zone."
      size="lg"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-paper p-3">
          <p className="text-sm text-slate">
            Last contact:{" "}
            {lead.last_contacted_at
              ? new Date(lead.last_contacted_at).toLocaleString()
              : "Not recorded"}
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={contacted}
          >
            Contacted just now
          </Button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Next action"
            placeholder="Call to discuss the proposal"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            maxLength={500}
            required
            disabled={busy}
          />
          <Input
            label="Remind me at"
            type="datetime-local"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            required
            disabled={busy}
          />
          <p className="text-xs text-slate">
            Due reminders appear in Today and the notification bell while CRM is
            open. Closed-app push is not enabled.
          </p>
          <Button type="submit" loading={busy}>
            Add follow-up
          </Button>
        </form>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Pending follow-ups</h3>
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted">
              No pending follow-ups for this lead.
            </p>
          ) : (
            items.map((i) => (
              <div key={i.id} className="rounded-xl border border-line p-3">
                <p className="text-sm font-medium break-words">{i.action}</p>
                <p className="mt-1 text-xs text-slate">
                  {new Date(i.due_at).toLocaleString()}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => finish(i.id, "done")}
                  >
                    Done
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => finish(i.id, "cancelled")}
                  >
                    Cancel reminder
                  </Button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </Dialog>
  );
}
