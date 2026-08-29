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
import { ConvertLeadDialog } from "@/features/clients/components/ConvertLeadDialog";
import {
  deleteLead,
  updateLeadStatus,
} from "@/features/leads/api";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadStatus } from "@/types/lead";
import {
  ArrowRight,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LeadsViewProps {
  initialLeads: Lead[];
  /** IDs of leads that already have a client (already converted). */
  convertedLeadIds: string[];
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  contacted: "Contacted",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
};

const ALL_STATUSES: LeadStatus[] = [
  "contacted",
  "negotiating",
  "won",
  "lost",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LeadsView({
  initialLeads,
  convertedLeadIds,
}: LeadsViewProps) {
  const router = useRouter();

  const [leads, setLeads] = useState(initialLeads);
  const [convertedIds, setConvertedIds] = useState(
    () => new Set(convertedLeadIds)
  );

  const [updatingId, setUpdatingId] = useState<string | null>(
    null
  );

  const [convertingLead, setConvertingLead] =
    useState<Lead | null>(null);

  const [deletingLead, setDeletingLead] =
    useState<Lead | null>(null);

  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  async function handleStatusChange(
    id: string,
    status: LeadStatus
  ) {
    setUpdatingId(id);

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, status }
          : lead
      )
    );

    try {
      const supabase = createClient();

      await updateLeadStatus(
        supabase,
        id,
        status
      );
    } catch (error) {
      router.refresh();
      throw error;
    } finally {
      setUpdatingId(null);
      router.refresh();
    }
  }

  function handleConverted(leadId: string) {
    setConvertedIds(
      (prev) => new Set(prev).add(leadId)
    );

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, status: "won" }
          : lead
      )
    );

    router.refresh();
  }

  function openDeleteDialog(lead: Lead) {
    setDeleteError(null);
    setDeletingLead(lead);
  }

  function closeDeleteDialog() {
    if (deleting) return;

    setDeletingLead(null);
    setDeleteError(null);
  }

  async function handleDeleteLead() {
    if (!deletingLead) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const supabase = createClient();

      await deleteLead(
        supabase,
        deletingLead.id
      );

      setLeads((prev) =>
        prev.filter(
          (lead) => lead.id !== deletingLead.id
        )
      );

      setConvertedIds((prev) => {
        const next = new Set(prev);
        next.delete(deletingLead.id);
        return next;
      });

      setDeletingLead(null);
      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete this lead."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Leads"
        description="Inquiries you've converted and are actively following up with."
      />

      {leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No leads yet"
          description="Convert an inquiry to a lead from the Inquiries page to see it here."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>
                Name
              </TableHeaderCell>

              <TableHeaderCell>
                Contact
              </TableHeaderCell>

              <TableHeaderCell>
                Notes
              </TableHeaderCell>

              <TableHeaderCell>
                Source
              </TableHeaderCell>

              <TableHeaderCell>
                Status
              </TableHeaderCell>

              <TableHeaderCell>
                Created
              </TableHeaderCell>

              <TableHeaderCell>
                Actions
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {leads.map((lead) => {
              const isConverted =
                convertedIds.has(lead.id);

              return (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.full_name}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span>{lead.email}</span>

                      {lead.phone && (
                        <Caption>
                          {lead.phone}
                        </Caption>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {lead.notes ? (
                      <p
                        className="max-w-xs truncate text-ink"
                        title={lead.notes}
                      >
                        {lead.notes}
                      </p>
                    ) : (
                      <Caption>—</Caption>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        lead.inquiry_id
                          ? "inquiry"
                          : "neutral"
                      }
                    >
                      {lead.inquiry_id
                        ? "From Inquiry"
                        : "Manual"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {isConverted ? (
                      <Badge variant="client">
                        Client
                      </Badge>
                    ) : (
                      <Select
                        aria-label={`Status for ${lead.full_name}`}
                        value={lead.status}
                        disabled={
                          updatingId === lead.id
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            lead.id,
                            event.target
                              .value as LeadStatus
                          )
                        }
                        className="h-8 min-w-[9.5rem] text-xs"
                      >
                        {ALL_STATUSES.map(
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
                      {formatDate(
                        lead.created_at
                      )}
                    </Caption>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      {!isConverted && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setConvertingLead(
                              lead
                            )
                          }
                        >
                          Convert to Client
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openDeleteDialog(lead)
                        }
                        aria-label={`Delete ${lead.full_name}`}
                        className="text-danger hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <ConvertLeadDialog
        key={convertingLead?.id ?? "none"}
        open={convertingLead !== null}
        lead={convertingLead}
        onClose={() =>
          setConvertingLead(null)
        }
        onConverted={handleConverted}
      />

      <Dialog
        open={deletingLead !== null}
        onClose={closeDeleteDialog}
        title="Delete lead?"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate">
            Are you sure you want to delete{" "}
            <span className="font-medium text-ink">
              {deletingLead?.full_name}
            </span>
            ? This action cannot be undone.
          </p>

          {deleteError && (
            <div
              role="alert"
              className="rounded-[var(--radius-sm)] border border-danger/20 bg-danger-soft px-3 py-2.5 text-sm leading-5 text-danger"
            >
              {deleteError}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDeleteDialog}
              disabled={deleting}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteLead}
              disabled={deleting}
            >
              {deleting
                ? "Deleting…"
                : "Delete lead"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}