"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { convertLeadToClient } from "@/features/clients/api";
import { createClient } from "@/lib/supabase/client";
import type { Lead } from "@/types/lead";
import { useState, type FormEvent } from "react";

interface ConvertLeadDialogProps {
  open: boolean;
  lead: Lead | null;
  onClose: () => void;
  /** Called after a successful conversion so the caller can update its list. */
  onConverted: (leadId: string) => void;
}

/**
 * ConvertLeadDialog — turns a Lead into a Client. Pre-fills contact
 * details and notes from the lead (editable), adds a company name field.
 * On submit, this creates the client AND marks the source lead "won" in
 * one step (see features/clients/api.ts convertLeadToClient) — mirrors
 * ConvertInquiryDialog from Phase 4.
 */
export function ConvertLeadDialog({ open, lead, onClose, onConverted }: ConvertLeadDialogProps) {
  // Same pattern as ConvertInquiryDialog: initialized directly from the
  // lead prop via lazy initializers. The parent remounts this with a
  // fresh key per lead, so no useEffect sync is needed.
  const [fullName, setFullName] = useState(() => lead?.full_name ?? "");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState(() => lead?.email ?? "");
  const [phone, setPhone] = useState(() => lead?.phone ?? "");
  const [notes, setNotes] = useState(() => lead?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!lead) return;
    setError(null);
    setSaving(true);

    try {
      const supabase = createClient();
      await convertLeadToClient(supabase, lead.id, {
        full_name: fullName,
        company_name: companyName || undefined,
        email,
        phone: phone || undefined,
        notes: notes || undefined,
      });
      setSaving(false);
      onConverted(lead.id);
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (!lead) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Convert to Client"
      description={`Turn ${lead.full_name} into a client and start a project relationship.`}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="convert-lead-form" loading={saving}>
            Convert to Client
          </Button>
        </>
      }
    >
      <form id="convert-lead-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Company (optional)"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Co."
        />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Phone (optional)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          error={error ?? undefined}
        />
      </form>
    </Dialog>
  );
}