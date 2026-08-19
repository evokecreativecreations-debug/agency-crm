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
import { ConvertLeadDialog } from "@/features/clients/components/ConvertLeadDialog";
import { updateLeadStatus } from "@/features/leads/api";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadStatus } from "@/types/lead";
import { ArrowRight, Users } from "lucide-react";
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

const ALL_STATUSES: LeadStatus[] = ["contacted", "negotiating", "won", "lost"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * LeadsView — list + status management for Leads, plus the "Convert to
 * Client" action (Phase 5). Same structure as InquiriesView (optimistic
 * status updates, EmptyState when empty).
 *
 * Clients have no status column, so "already converted" is derived from
 * `convertedLeadIds` (see features/clients/api.ts getConvertedLeadIds)
 * rather than a status value — once a lead is in that set, its status
 * dropdown is replaced with a "Client" badge and the convert button
 * disappears, mirroring how InquiriesView handles converted_to_lead.
 */
export function LeadsView({ initialLeads, convertedLeadIds }: LeadsViewProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [convertedIds, setConvertedIds] = useState(() => new Set(convertedLeadIds));
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  async function handleStatusChange(id: string, status: LeadStatus) {
    setUpdatingId(id);
    // Optimistic update so the dropdown feels instant.
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      const supabase = createClient();
      await updateLeadStatus(supabase, id, status);
    } finally {
      setUpdatingId(null);
      router.refresh();
    }
  }

  function handleConverted(leadId: string) {
    // Optimistic update — ConvertLeadDialog has already confirmed the
    // conversion succeeded server-side (client created + lead marked
    // "won") before calling this, so this just reflects it instantly.
    setConvertedIds((prev) => new Set(prev).add(leadId));
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: "won" } : l)));
    router.refresh();
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
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Notes</TableHeaderCell>
              <TableHeaderCell>Source</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Created</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => {
              const isConverted = convertedIds.has(lead.id);
              return (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.full_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{lead.email}</span>
                      {lead.phone && <Caption>{lead.phone}</Caption>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.notes ? (
                      <p className="max-w-xs truncate text-ink" title={lead.notes}>
                        {lead.notes}
                      </p>
                    ) : (
                      <Caption>—</Caption>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.inquiry_id ? "inquiry" : "neutral"}>
                      {lead.inquiry_id ? "From Inquiry" : "Manual"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isConverted ? (
                      <Badge variant="client">Client</Badge>
                    ) : (
                      <Select
                        aria-label={`Status for ${lead.full_name}`}
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) =>
                          handleStatusChange(lead.id, e.target.value as LeadStatus)
                        }
                        className="h-8 min-w-[9.5rem] text-xs"
                      >
                        {ALL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABEL[status]}
                          </option>
                        ))}
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Caption>{formatDate(lead.created_at)}</Caption>
                  </TableCell>
                  <TableCell>
                    {!isConverted && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConvertingLead(lead)}
                      >
                        Convert to Client <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
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
        onClose={() => setConvertingLead(null)}
        onConverted={handleConverted}
      />
    </>
  );
}