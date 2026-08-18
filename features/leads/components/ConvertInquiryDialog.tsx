"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { convertInquiryToLead } from "@/features/leads/api";
import { createClient } from "@/lib/supabase/client";
import type { Inquiry } from "@/types/inquiry";
import { useState, type FormEvent } from "react";

interface ConvertInquiryDialogProps {
  open: boolean;
  inquiry: Inquiry | null;
  onClose: () => void;
  /** Called after a successful conversion so the caller can update its list. */
  onConverted: (inquiryId: string) => void;
}

/**
 * ConvertInquiryDialog — turns an Inquiry into a Lead. Pre-fills contact
 * details from the inquiry (editable, in case something needs correcting
 * on the way in) and adds an optional notes field. On submit, this
 * creates the lead AND marks the source inquiry as "converted_to_lead"
 * in one step (see features/leads/api.ts convertInquiryToLead).
 */
export function ConvertInquiryDialog({
  open,
  inquiry,
  onClose,
  onConverted,
}: ConvertInquiryDialogProps) {
  // Initialized directly from the inquiry prop rather than synced via an
  // effect — the parent remounts this component with a fresh key each
  // time a different inquiry is opened for conversion (see InquiriesView),
  // so these lazy initializers naturally give each conversion a clean form.
  const [fullName, setFullName] = useState(() => inquiry?.full_name ?? "");
  const [email, setEmail] = useState(() => inquiry?.email ?? "");
  const [phone, setPhone] = useState(() => inquiry?.phone ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!inquiry) return;
    setError(null);
    setSaving(true);

    try {
      const supabase = createClient();
      await convertInquiryToLead(supabase, inquiry.id, {
        full_name: fullName,
        email,
        phone: phone || undefined,
        notes: notes || undefined,
      });
      setSaving(false);
      onConverted(inquiry.id);
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (!inquiry) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Convert to Lead"
      description={`Turn ${inquiry.full_name}'s inquiry into a lead you're following up with.`}
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="convert-inquiry-form" loading={saving}>
            Convert to Lead
          </Button>
        </>
      }
    >
      <form id="convert-inquiry-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
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
          placeholder="Any context to carry over for follow-up..."
          error={error ?? undefined}
        />
      </form>
    </Dialog>
  );
}