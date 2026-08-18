"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { Caption } from "@/components/ui/Typography";
import { NewInquiryDialog } from "@/features/inquiries/components/NewInquiryDialog";
import { updateInquiryStatus } from "@/features/inquiries/api";
import { ConvertInquiryDialog } from "@/features/leads/components/ConvertInquiryDialog";
import { createClient } from "@/lib/supabase/client";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import { ArrowRight, Inbox, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface InquiriesViewProps {
  initialInquiries: Inquiry[];
}

const STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  converted_to_lead: "Converted to Lead",
  discarded: "Discarded",
};

/**
 * Statuses a team member can manually set from this screen. "Converted to
 * Lead" is excluded here on purpose — that status will be set
 * automatically by the Leads feature in Phase 4, not chosen by hand.
 */
const MANUALLY_SETTABLE_STATUSES: InquiryStatus[] = ["new", "reviewed", "discarded"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function InquiriesView({ initialInquiries }: InquiriesViewProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [convertingInquiry, setConvertingInquiry] = useState<Inquiry | null>(null);

  function refresh() {
    router.refresh();
  }

  async function handleStatusChange(id: string, status: InquiryStatus) {
    setUpdatingId(id);
    // Optimistic update so the dropdown feels instant.
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      const supabase = createClient();
      await updateInquiryStatus(supabase, id, status);
    } finally {
      setUpdatingId(null);
      refresh();
    }
  }

  function handleConverted(inquiryId: string) {
    // Optimistic update — ConvertInquiryDialog has already confirmed the
    // conversion succeeded server-side (lead created + inquiry status
    // updated) before calling this, so this just reflects it instantly.
    setInquiries((prev) =>
      prev.map((i) => (i.id === inquiryId ? { ...i, status: "converted_to_lead" } : i))
    );
    refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Inquiries"
        description="Everything that's come in from your website form or been added manually."
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Inquiry
          </Button>
        }
      />

      {inquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No inquiries yet"
          description="New inquiries from your website will show up here automatically. You can also add one manually."
          action={{ label: "Add manually", onClick: () => setDialogOpen(true) }}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Message</TableHeaderCell>
              <TableHeaderCell>Source</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Received</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="font-medium">{inquiry.full_name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{inquiry.email}</span>
                    {inquiry.phone && <Caption>{inquiry.phone}</Caption>}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="max-w-xs truncate text-ink" title={inquiry.message}>
                    {inquiry.message}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant={inquiry.source === "website_form" ? "info" : "neutral"}>
                    {inquiry.source === "website_form" ? "Website" : "Manual"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {inquiry.status === "converted_to_lead" ? (
                    <Badge variant="client">{STATUS_LABEL.converted_to_lead}</Badge>
                  ) : (
                    <Select
                      aria-label={`Status for ${inquiry.full_name}`}
                      value={inquiry.status}
                      disabled={updatingId === inquiry.id}
                      onChange={(e) =>
                        handleStatusChange(inquiry.id, e.target.value as InquiryStatus)
                      }
                      className="h-8 min-w-[9.5rem] text-xs"
                    >
                      {MANUALLY_SETTABLE_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </option>
                      ))}
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  <Caption>{formatDate(inquiry.created_at)}</Caption>
                </TableCell>
                <TableCell>
                  {inquiry.status !== "converted_to_lead" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConvertingInquiry(inquiry)}
                    >
                      Convert to Lead <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <NewInquiryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={refresh}
      />

      <ConvertInquiryDialog
        key={convertingInquiry?.id ?? "none"}
        open={convertingInquiry !== null}
        inquiry={convertingInquiry}
        onClose={() => setConvertingInquiry(null)}
        onConverted={handleConverted}
      />
    </>
  );
}