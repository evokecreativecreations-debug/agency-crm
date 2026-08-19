"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { createProject } from "@/features/projects/api";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/types/client";
import type { Project } from "@/types/project";
import { useState, type FormEvent } from "react";

interface NewProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
  /** Clients available to pick from. */
  clients: Client[];
  /**
   * When set, the client field is locked to this client instead of showing
   * a picker — used when creating a project from a Client's detail page
   * (Phase 6 requirement: "the Project must automatically belong to that
   * Client"). Omit to show a normal client picker (used from /projects).
   */
  lockedClientId?: string;
}

/**
 * NewProjectDialog — one reusable dialog for both entry points into
 * project creation, rather than two separate components:
 *  - From /projects: shows a Select to choose which client this is for.
 *  - From /clients/[id]: the client is pre-locked (shown as a disabled
 *    field), so the project is automatically attached to that client.
 */
export function NewProjectDialog({
  open,
  onClose,
  onCreated,
  clients,
  lockedClientId,
}: NewProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState(lockedClientId ?? "");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const lockedClient = lockedClientId
    ? clients.find((c) => c.id === lockedClientId)
    : undefined;

  function resetAndClose() {
    setTitle("");
    setDescription("");
    setClientId(lockedClientId ?? "");
    setStartDate("");
    setDueDate("");
    setError(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientId) {
      setError("Please select a client.");
      return;
    }
    setError(null);
    setSaving(true);

    try {
      const supabase = createClient();
      const project = await createProject(supabase, {
        client_id: clientId,
        title,
        description: description || undefined,
        start_date: startDate || undefined,
        due_date: dueDate || undefined,
      });
      setSaving(false);
      resetAndClose();
      onCreated(project);
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      title="New Project"
      description="Start a new project for a client."
      footer={
        <>
          <Button variant="outline" onClick={resetAndClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="new-project-form" loading={saving}>
            Create Project
          </Button>
        </>
      }
    >
      <form id="new-project-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {lockedClient ? (
          <Input label="Client" value={lockedClient.full_name} disabled />
        ) : (
          <Select
            label="Client"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            error={error && !clientId ? error : undefined}
          >
            <option value="">Select a client...</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name}
                {client.company_name ? ` (${client.company_name})` : ""}
              </option>
            ))}
          </Select>
        )}
        <Input
          label="Project title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brand Refresh"
        />
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this project about?"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start date (optional)"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Due date (optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        {error && clientId && <p className="text-xs text-danger">{error}</p>}
      </form>
    </Dialog>
  );
}