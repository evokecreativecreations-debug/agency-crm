"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/Table";
import { Caption } from "@/components/ui/Typography";
import { ServiceFormDialog } from "@/features/services/components/ServiceFormDialog";
import { updateService } from "@/features/services/api";
import { createClient } from "@/lib/supabase/client";
import type { Service } from "@/types/service";
import { Pencil, Plus, Tag } from "lucide-react";
import { useMemo, useState } from "react";

interface ServicesViewProps { initialServices: Service[]; }

function formatCurrency(amount: number | null) {
  return amount === null ? "—" : new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

/** Catalog list, with create/edit and safe retirement rather than deletion. */
export function ServicesView({ initialServices }: ServicesViewProps) {
  const [services, setServices] = useState(initialServices);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const filteredServices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return services;
    return services.filter((service) => [service.name, service.description].filter(Boolean).some((value) => value!.toLowerCase().includes(normalizedQuery)));
  }, [query, services]);

  function handleCreated(service: Service) {
    setServices((current) => [...current, service].sort((a, b) => a.name.localeCompare(b.name)));
    setDialogOpen(false);
  }
  function handleEdited(service: Service) {
    setServices((current) => current.map((item) => (item.id === service.id ? service : item)));
    setEditingService(null);
  }
  async function handleActiveChange(service: Service) {
    setUpdatingId(service.id);
    const isActive = !service.is_active;
    setServices((current) => current.map((item) => (item.id === service.id ? { ...item, is_active: isActive } : item)));
    try {
      await updateService(createClient(), service.id, { is_active: isActive });
    } catch {
      setServices((current) => current.map((item) => (item.id === service.id ? service : item)));
    } finally { setUpdatingId(null); }
  }

  return <>
    <PageHeader eyebrow="Catalog" title="Services" description="Reusable services and starting prices for your agency." actions={<div className="flex flex-wrap items-center gap-2">{services.length > 0 && <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services..." containerClassName="max-w-xs" />}<Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-3.5 w-3.5" /> New Service</Button></div>} />
    {services.length === 0 ? <EmptyState icon={Tag} title="No services yet" description="Add the services your agency offers to reuse them when creating projects." action={{ label: "New Service", onClick: () => setDialogOpen(true) }} /> : filteredServices.length === 0 ? <EmptyState icon={Tag} title="No matching services" description={`Nothing matches "${query}". Try a different search.`} /> : <Table><TableHead><TableRow><TableHeaderCell>Service</TableHeaderCell><TableHeaderCell>Default Price</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell className="text-right">Actions</TableHeaderCell></TableRow></TableHead><TableBody>{filteredServices.map((service) => <TableRow key={service.id}><TableCell><div className="flex flex-col gap-0.5"><span className="font-medium">{service.name}</span>{service.description && <Caption>{service.description}</Caption>}</div></TableCell><TableCell>{formatCurrency(service.default_price)}</TableCell><TableCell><Badge variant={service.is_active ? "success" : "neutral"}>{service.is_active ? "Active" : "Retired"}</Badge></TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setEditingService(service)}><Pencil className="h-3.5 w-3.5" /> Edit</Button><Button size="sm" variant="ghost" disabled={updatingId === service.id} onClick={() => handleActiveChange(service)}>{service.is_active ? "Retire" : "Reactivate"}</Button></div></TableCell></TableRow>)}</TableBody></Table>}
    <ServiceFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSaved={handleCreated} />
    <ServiceFormDialog key={editingService?.id ?? "none"} open={editingService !== null} service={editingService} onClose={() => setEditingService(null)} onSaved={handleEdited} />
  </>;
}
