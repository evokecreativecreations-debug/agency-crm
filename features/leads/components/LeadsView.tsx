"use client";

import { Badge } from "@/components/ui/Badge";
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
import { updateLeadStatus } from "@/features/leads/api";
import { createClient } from "@/lib/supabase/client";
import type { Lead, LeadStatus } from "@/types/lead";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LeadsViewProps {
  initialLeads: Lead[];
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
 * LeadsView — list + status management for Leads. Same structure as
 * InquiriesView (optimistic status updates, EmptyState when empty).
 *
 * Note: "Won" doesn't yet trigger Lead → Client conversion — that's
 * Phase 5. For now it's just a status you can set manually.
 */
export function LeadsView({ initialLeads }: LeadsViewProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => (
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
                  <Select
                    aria-label={`Status for ${lead.full_name}`}
                    value={lead.status}
                    disabled={updatingId === lead.id}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                    className="h-8 min-w-[9.5rem] text-xs"
                  >
                    {ALL_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </option>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Caption>{formatDate(lead.created_at)}</Caption>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}