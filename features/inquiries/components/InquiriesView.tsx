"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
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
import {
  deleteInquiry,
  updateInquiryStatus,
} from "@/features/inquiries/api";
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

const MANUALLY_SETTABLE_STATUSES: InquiryStatus[] = [
  "new",
  "reviewed",
  "discarded",
];

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
  const [convertingInquiry, setConvertingInquiry] =
    useState<Inquiry | null>(null);

  const [deletingInquiry, setDeletingInquiry] =
    useState<Inquiry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  async function handleStatusChange(
    id: string,
    status: InquiryStatus
  ) {
    setUpdatingId(id);

    // Optimistic update so the dropdown feels instant.
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status } : i
      )
    );

    try {
      const supabase = createClient();
      await updateInquiryStatus(supabase, id, status);
    } finally {
      setUpdatingId(null);
      refresh();
    }
  }

  function handleConverted(inquiryId: string) {
    // Optimistic update — conversion has already succeeded server-side.
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === inquiryId
          ? { ...i, status: "converted_to_lead" }
          : i
      )
    );

    refresh();
  }

  function openDeleteDialog(inquiry: Inquiry) {
    setDeleteError(null);
    setDeletingInquiry(inquiry);
  }

  function closeDeleteDialog() {
    if (deleting) return;

    setDeletingInquiry(null);
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deletingInquiry) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const supabase = createClient();

      await deleteInquiry(
        supabase,
        deletingInquiry.id
      );

      // Optimistic/local removal.
      setInquiries((prev) =>
        prev.filter(
          (inquiry) => inquiry.id !== deletingInquiry.id
        )
      );

      setDeletingInquiry(null);
      refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Inquiries"
        description="Everything that's come in from your website form or been added manually."
        actions={
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
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
              <TableHeaderCell>Actions</TableHeaderCell>
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
                      {MANUALLY_SETTABLE_STATUSES.map(
                        (status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {STATUS_LABEL[status]}
                          </option>
                        )
                      )}
                    </Select>
                  )}
                </TableCell>

                <TableCell>
                  <Caption>
                    {formatDate(inquiry.created_at)}
                  </Caption>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-1">
                    {inquiry.status !== "converted_to_lead" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setConvertingInquiry(inquiry)
                        }
                      >
                        Convert to Lead
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openDeleteDialog(inquiry)
                      }
                      disabled={deleting}
                    >
                      Delete
                    </Button>
                  </div>
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

      <Dialog
        open={deletingInquiry !== null}
        onClose={closeDeleteDialog}
        title="Delete inquiry?"
        description={
          deletingInquiry
            ? `This will permanently delete ${deletingInquiry.full_name}'s inquiry.`
            : undefined
        }
        footer={
          <>
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              variant="outline"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Inquiry
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink">
            This action cannot be undone.
          </p>

          <p className="text-sm text-slate">
            If this inquiry was already converted to a lead,
            the lead will remain intact.
          </p>

          {deleteError && (
            <p className="text-sm text-red-600">
              {deleteError}
            </p>
          )}
        </div>
      </Dialog>
    </>
  );
}