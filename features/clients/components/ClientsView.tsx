"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
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
import { deleteClient } from "@/features/clients/api";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/types/client";
import { Briefcase, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";

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

export function ClientsView({
  initialClients,
}: ClientsViewProps) {
  const router = useRouter();

  const [clients, setClients] =
    useState(initialClients);

  const [query, setQuery] = useState("");

  const [deletingClient, setDeletingClient] =
    useState<Client | null>(null);

  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  const [deleting, setDeleting] =
    useState(false);

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return clients;

    return clients.filter((client) =>
      [
        client.full_name,
        client.company_name,
        client.email,
      ]
        .filter(Boolean)
        .some((field) =>
          field!.toLowerCase().includes(q)
        )
    );
  }, [clients, query]);

  function openDeleteDialog(client: Client) {
    setDeleteError(null);
    setDeletingClient(client);
  }

  function closeDeleteDialog() {
    if (deleting) return;

    setDeletingClient(null);
    setDeleteError(null);
  }

  async function handleDeleteClient() {
    if (!deletingClient) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      const supabase = createClient();

      await deleteClient(
        supabase,
        deletingClient.id
      );

      setClients((prev) =>
        prev.filter(
          (client) =>
            client.id !== deletingClient.id
        )
      );

      setDeletingClient(null);

      router.refresh();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete this client."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Clients"
        description="Everyone you're actively working with or have worked with before."
        actions={
          clients.length > 0 ? (
            <SearchBar
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search clients..."
              containerClassName="max-w-xs"
            />
          ) : undefined
        }
      />

      {clients.length === 0 ? (
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
              <TableHeaderCell>
                Name
              </TableHeaderCell>

              <TableHeaderCell>
                Company
              </TableHeaderCell>

              <TableHeaderCell>
                Contact
              </TableHeaderCell>

              <TableHeaderCell>
                Source
              </TableHeaderCell>

              <TableHeaderCell>
                Client Since
              </TableHeaderCell>

              <TableHeaderCell>
                Actions
              </TableHeaderCell>
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
                  {client.company_name || (
                    <Caption>—</Caption>
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span>
                      {client.email}
                    </span>

                    {client.phone && (
                      <Caption>
                        {client.phone}
                      </Caption>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={
                      client.lead_id
                        ? "lead"
                        : "neutral"
                    }
                  >
                    {client.lead_id
                      ? "From Lead"
                      : "Manual"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Caption>
                    {formatDate(
                      client.created_at
                    )}
                  </Caption>
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      openDeleteDialog(client)
                    }
                    aria-label={`Delete ${client.full_name}`}
                    className="text-danger hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={deletingClient !== null}
        onClose={closeDeleteDialog}
        title="Delete client?"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate">
            Are you sure you want to delete{" "}
            <span className="font-medium text-ink">
              {deletingClient?.full_name}
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
              onClick={handleDeleteClient}
              disabled={deleting}
            >
              {deleting
                ? "Deleting…"
                : "Delete client"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}