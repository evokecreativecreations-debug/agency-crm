"use client";

import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { Caption } from "@/components/ui/Typography";
import type { Client } from "@/types/client";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface ClientsViewProps {
  initialClients: Client[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * ClientsView — list of clients with a working search filter (name,
 * company, or email). Same structure as InquiriesView/LeadsView; clients
 * have no status field in the frozen schema, so there's no status
 * dropdown here — just a link through to the detail page.
 */
export function ClientsView({ initialClients }: ClientsViewProps) {
  const [query, setQuery] = useState("");

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialClients;
    return initialClients.filter((client) =>
      [client.full_name, client.company_name, client.email]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [initialClients, query]);

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Clients"
        description="Everyone you're actively working with or have worked with before."
        actions={
          initialClients.length > 0 ? (
            <SearchBar
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients..."
              containerClassName="max-w-xs"
            />
          ) : undefined
        }
      />

      {initialClients.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No clients yet"
          description="Convert a lead to a client from the Leads page to see it here."
        />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No matching clients"
          description={`Nothing matches "${query}". Try a different search.`}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Company</TableHeaderCell>
              <TableHeaderCell>Contact</TableHeaderCell>
              <TableHeaderCell>Source</TableHeaderCell>
              <TableHeaderCell>Client Since</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-ink transition-colors hover:text-signal hover:underline"
                  >
                    {client.full_name}
                  </Link>
                </TableCell>
                <TableCell>
                  {client.company_name || <Caption>—</Caption>}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{client.email}</span>
                    {client.phone && <Caption>{client.phone}</Caption>}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={client.lead_id ? "lead" : "neutral"}>
                    {client.lead_id ? "From Lead" : "Manual"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Caption>{formatDate(client.created_at)}</Caption>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}