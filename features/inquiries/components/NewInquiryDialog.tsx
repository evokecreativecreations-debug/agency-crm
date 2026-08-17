"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createInquiry } from "@/features/inquiries/api";
import { createClient } from "@/lib/supabase/client";
import { useState, type FormEvent } from "react";

interface NewInquiryDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called after a successful save so the parent can refresh its list. */
  onCreated: () => void;
}

/**
 * NewInquiryDialog — the "Add manually" flow for Inquiries. Covers the
 * case where someone contacts the agency outside the website form (a
 * phone call, a DM, an in-person conversation) and you want it tracked
 * in the same pipeline.
 */
export function NewInquiryDialog({ open, onClose, onCreated }: NewInquiryDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function resetAndClose() {
    setFullName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const supabase = createClient();
      await createInquiry(supabase, {
        full_name: fullName,
        email,
        phone: phone || undefined,
        message,
      });
      setSaving(false);
      resetAndClose();
      onCreated();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      title="Add Inquiry"
      description="Log an inquiry that came in outside your website form."
      footer={
        <>
          <Button variant="outline" onClick={resetAndClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="new-inquiry-form" loading={saving}>
            Save Inquiry
          </Button>
        </>
      }
    >
      <form id="new-inquiry-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Full name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Cooper"
        />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@company.com"
        />
        <Input
          label="Phone (optional)"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+92 300 1234567"
        />
        <Textarea
          label="Message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What are they interested in?"
          error={error ?? undefined}
        />
      </form>
    </Dialog>
  );
}