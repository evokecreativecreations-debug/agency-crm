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
import { createClient } from "@/lib/supabase/client";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import { Inbox, Plus } from "lucide-react";
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
 * Statuses a team member can manually set from this screen.
 * "Converted to Lead" is set automatically in Phase 4.
 */
const MANUALLY_SETTABLE_STATUSES: InquiryStatus[] = [
  "new",
  "reviewed",
  "discarded",
];

/**
 * Uses a fixed locale and timezone so the server and browser
 * render exactly the same output (prevents hydration warnings).
 */
function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function InquiriesView({ initialInquiries }: InquiriesViewProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  async function handleStatusChange(id: string, status: InquiryStatus) {
    setUpdatingId(id);

    // Optimistic update
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );

    try {
      const supabase = createClient();
      await updateInquiryStatus(supabase, id, status);
    } finally {
      setUpdatingId(null);
      refresh();
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Inquiries"
        description="Everything that's come in from your website form or been added manually."
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Inquiry
          </Button>
        }
      />

      {inquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No inquiries yet"
          description="New inquiries from your website will show up here automatically. You can also add one manually."
          action={{
            label: "Add manually",
            onClick: () => setDialogOpen(true),
          }}
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
            </TableRow>
          </TableHead>

          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="font-medium">
                  {inquiry.full_name}
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span>{inquiry.email}</span>
                    {inquiry.phone && (
                      <Caption>{inquiry.phone}</Caption>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <p
                    className="max-w-xs truncate text-ink"
                    title={inquiry.message}
                  >
                    {inquiry.message}
                  </p>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      inquiry.source === "website_form"
                        ? "info"
                        : "neutral"
                    }
                  >
                    {inquiry.source === "website_form"
                      ? "Website"
                      : "Manual"}
                  </Badge>
                </TableCell>

                <TableCell>
                  {inquiry.status === "converted_to_lead" ? (
                    <Badge variant="client">
                      {STATUS_LABEL.converted_to_lead}
                    </Badge>
                  ) : (
                    <Select
                      aria-label={`Status for ${inquiry.full_name}`}
                      value={inquiry.status}
                      disabled={updatingId === inquiry.id}
                      onChange={(e) =>
                        handleStatusChange(
                          inquiry.id,
                          e.target.value as InquiryStatus
                        )
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
    </>
  );
}