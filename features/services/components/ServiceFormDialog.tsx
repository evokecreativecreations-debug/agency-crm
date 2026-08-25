"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createService, updateService } from "@/features/services/api";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/types/service";
import { useState, type FormEvent } from "react";

interface ServiceFormDialogProps {
  open: boolean;
  service?: Service | null;
  onClose: () => void;
  onSaved: (service: Service) => void;
}

/** One form for adding or editing a catalog service. */
export function ServiceFormDialog({ open, service, onClose, onSaved }: ServiceFormDialogProps) {
  const isEditing = !!service;
  const [name, setName] = useState(() => service?.name ?? "");
  const [description, setDescription] = useState(() => service?.description ?? "");
  const [defaultPrice, setDefaultPrice] = useState(() =>
    service?.default_price == null ? "" : String(service.default_price)
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const parsedPrice = defaultPrice === "" ? undefined : Number(defaultPrice);

    if (!trimmedName) {
      setError("Service name is required.");
      return;
    }
    if (parsedPrice !== undefined && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setError("Default price must be zero or more.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const supabase = createClient();
      if (isEditing && service) {
        await updateService(supabase, service.id, {
          name: trimmedName,
          description: description.trim() || null,
          default_price: parsedPrice ?? null,
        });
        onSaved({ ...service, name: trimmedName, description: description.trim() || null, default_price: parsedPrice ?? null });
      } else {
        const created = await createService(supabase, {
          name: trimmedName,
          description: description.trim() || undefined,
          default_price: parsedPrice,
        });
        onSaved(created);
      }
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={isEditing ? `Edit ${service?.name}` : "New Service"}
      description="Save a reusable service and its optional starting price."
      footer={<><Button variant="outline" onClick={handleClose} disabled={saving}>Cancel</Button><Button type="submit" form="service-form" loading={saving}>{isEditing ? "Save Changes" : "Create Service"}</Button></>}
    >
      <form id="service-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Service name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Logo Design" error={error ?? undefined} />
        <Textarea label="Description (optional)" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is included in this service?" />
        <Input label="Default price (optional)" type="number" min="0" step="0.01" value={defaultPrice} onChange={(event) => setDefaultPrice(event.target.value)} placeholder="1500.00" helperText="Used as a starting point; project pricing remains editable." />
      </form>
    </Dialog>
  );
}
