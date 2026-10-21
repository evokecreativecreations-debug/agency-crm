"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, Download, ArrowRight, Pencil } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { BillingEditor } from "./BillingEditor";
import { emptyBilling, money, validateBilling } from "../billing";
import { saveQuotation } from "../quotations";
import { createClient } from "@/lib/supabase/client";
import type {
  BillingFields,
  Quotation,
  QuotationStatus,
} from "@/types/billing";
type Contact = { id: string; full_name: string; email: string };
type ClientContact = Contact & { lead_id: string | null };
type ProjectOption = { id: string; client_id: string; title: string };
interface Props {
  initialQuotes: Quotation[];
  leads: Contact[];
  clients: ClientContact[];
  projects: ProjectOption[];
  preview?: boolean;
}
export function QuotationsView({
  initialQuotes,
  leads,
  clients,
  projects,
  preview = false,
}: Props) {
  const router = useRouter();
  const [quotes, setQuotes] = useState(initialQuotes);
  const [editing, setEditing] = useState<Quotation | "new" | null>(null);
  const [converting, setConverting] = useState<Quotation | null>(null);
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  function saved(q: Quotation) {
    setQuotes((prev) => [q, ...prev.filter((i) => i.id !== q.id)]);
    setEditing(null);
    router.refresh();
  }
  async function status(q: Quotation, status: QuotationStatus) {
    if (preview) {
      setError("Sample preview only.");
      return;
    }
    setBusy(true);
    setError("");
    const { data, error } = await createClient()
      .from("quotations")
      .update({ status })
      .eq("id", q.id)
      .select()
      .single();
    if (error) setError(error.message);
    else saved(data);
    setBusy(false);
  }
  const validProjects = converting
    ? projects.filter((p) => {
        const c = clients.find((c) => c.id === p.client_id);
        return converting.client_id
          ? p.client_id === converting.client_id
          : c?.lead_id === converting.lead_id;
      })
    : [];
  async function convert(e: FormEvent) {
    e.preventDefault();
    if (!converting) return;
    if (preview) {
      setError("Sample preview only.");
      return;
    }
    setBusy(true);
    setError("");
    const { data, error } = await createClient()
      .rpc("convert_quotation_to_invoice", {
        p_quotation_id: converting.id,
        p_project_id: projectId,
        p_due_date: dueDate || null,
      })
      .single();
    if (error) setError(error.message);
    else {
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === converting.id
            ? { ...q, invoice_id: (data as { id: string }).id }
            : q,
        ),
      );
      setConverting(null);
      router.refresh();
    }
    setBusy(false);
  }
  const visible = quotes.filter(
    (q) =>
      (filter === "all" || q.status === filter) &&
      `${q.quotation_number} ${q.recipient_name} ${q.recipient_email}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Quotations"
        description="Prepare a proposal, share its PDF, then turn an accepted quote into a project invoice."
        actions={
          <Button
            onClick={() => {
              setError("");
              setEditing("new");
            }}
          >
            <Plus className="h-4 w-4" />
            New quotation
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Draft quotes",
            value: quotes.filter((q) => q.status === "draft").length,
          },
          {
            label: "Awaiting response",
            value: quotes.filter((q) => q.status === "sent").length,
          },
          {
            label: "Accepted value",
            value: money(
              quotes
                .filter((q) => q.status === "accepted")
                .reduce((s, q) => s + Number(q.amount), 0),
            ),
          },
        ].map((m) => (
          <Card key={m.label} className="p-5">
            <p className="text-xs text-slate">{m.label}</p>
            <p className="mt-3 text-2xl font-semibold">{m.value}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          label="Search quotations"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Number, name or email"
        />
        <Select
          label="Status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="sm:max-w-48"
        >
          <option value="all">All statuses</option>
          {["draft", "sent", "accepted", "declined", "expired"].map((s) => (
            <option key={s} value={s}>
              {s.replace(/^./, (x) => x.toUpperCase())}
            </option>
          ))}
        </Select>
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {visible.length === 0 ? (
        <Card className="p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted" />
          <h2 className="mt-3 font-semibold">
            {quotes.length
              ? "No matching quotations"
              : "Your first proposal starts here"}
          </h2>
          <p className="mt-2 text-sm text-slate">
            Add services, a price and payment terms. Save a draft before
            sharing.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((q) => (
            <Card key={q.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-wide text-muted">
                    {q.quotation_number}
                  </p>
                  <h2 className="mt-1 font-semibold break-words">
                    {q.recipient_name}
                  </h2>
                  <p className="mt-1 text-xs text-slate break-all">
                    {q.recipient_email}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {q.valid_until
                      ? `Valid until ${q.valid_until}`
                      : "No expiry date"}
                    {q.valid_until &&
                    q.valid_until < new Date().toLocaleDateString("en-CA") &&
                    !["accepted", "declined", "expired"].includes(q.status)
                      ? " · Validity ended"
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{money(q.amount)}</p>
                  <span className="mt-1 inline-block rounded-full bg-signal-soft px-2.5 py-1 text-xs capitalize text-signal">
                    {q.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!q.invoice_id || busy}
                  onClick={() => setEditing(q)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                {preview ? (
                  <span className="px-3 text-xs text-muted">Sample PDF</span>
                ) : (
                  <a
                    href={`/api/billing/quotation/${q.id}/pdf`}
                    className="inline-flex h-8 items-center gap-2 rounded-md border border-line-strong px-3 text-xs font-medium hover:bg-paper"
                  >
                    <Download className="h-3.5 w-3.5" />
                    PDF
                  </a>
                )}
                <Select
                  aria-label={`Status for ${q.quotation_number}`}
                  value={q.status}
                  className="h-8 w-36 text-xs"
                  disabled={busy || !!q.invoice_id}
                  onChange={(e) => status(q, e.target.value as QuotationStatus)}
                >
                  {["draft", "sent", "accepted", "declined", "expired"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s.replace(/^./, (x) => x.toUpperCase())}
                      </option>
                    ),
                  )}
                </Select>
                {q.invoice_id ? (
                  <Link href="/invoices" className="text-xs text-signal">
                    View converted invoice{" "}
                    <ArrowRight className="inline h-3 w-3" />
                  </Link>
                ) : (
                  q.status === "accepted" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setError("");
                        setProjectId("");
                        setDueDate("");
                        setConverting(q);
                      }}
                    >
                      Create invoice
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      <p className="text-xs leading-5 text-muted">
        Download the PDF to share with your client. Set “Sent” after sharing and
        “Accepted” after client approval. Quotation values are separate from
        invoice revenue.
      </p>
      {editing && (
        <QuotationForm
          key={editing === "new" ? "new" : editing.id}
          quote={editing === "new" ? null : editing}
          leads={leads}
          clients={clients}
          onClose={() => setEditing(null)}
          onSaved={saved}
          preview={preview}
        />
      )}
      <Dialog
        open={!!converting}
        onClose={() => {
          if (!busy) setConverting(null);
        }}
        title="Create invoice from quotation"
        description="The accepted items and terms will be copied into one draft invoice."
      >
        <form onSubmit={convert} className="space-y-4">
          {validProjects.length ? (
            <Select
              label="Project for this contact"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="">Choose a project…</option>
              {validProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          ) : (
            <p className="text-sm text-slate">
              Convert this lead to a client and create their project first, or
              create a project for the existing client.{" "}
              <Link className="text-signal" href="/projects">
                Open projects
              </Link>
            </p>
          )}
          <Input
            label="Invoice due date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <Button type="submit" disabled={!projectId} loading={busy}>
            Create draft invoice
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
function QuotationForm({
  quote,
  leads,
  clients,
  onClose,
  onSaved,
  preview,
}: {
  quote: Quotation | null;
  leads: Contact[];
  clients: ClientContact[];
  onClose: () => void;
  onSaved: (q: Quotation) => void;
  preview: boolean;
}) {
  const [fields, setFields] = useState<BillingFields>(quote ?? emptyBilling());
  const [contact, setContact] = useState(
    quote
      ? `${quote.client_id ? "client" : "lead"}:${quote.client_id ?? quote.lead_id}`
      : "",
  );
  const [valid, setValid] = useState(quote?.valid_until ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      validateBilling(fields);
      if (preview)
        throw new Error("Sample preview only. Changes are not saved.");
      setBusy(true);
      const [kind, id] = contact.split(":");
      const payload = {
        line_items: fields.line_items,
        discount_amount: fields.discount_amount,
        tax_rate: fields.tax_rate,
        deposit_amount: fields.deposit_amount,
        notes: fields.notes,
        payment_terms: fields.payment_terms,
        lead_id: kind === "lead" ? id : null,
        client_id: kind === "client" ? id : null,
        valid_until: valid || null,
      };
      onSaved(await saveQuotation(createClient(), payload, quote?.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save quotation.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open
      onClose={() => {
        if (!busy) onClose();
      }}
      title={quote ? `Edit ${quote.quotation_number}` : "New quotation"}
      size="lg"
      footer={
        <>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="quotation-form" loading={busy}>
            Save quotation
          </Button>
        </>
      }
    >
      <form id="quotation-form" onSubmit={submit} className="space-y-5">
        <Select
          label="Prepare for"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          disabled={busy}
        >
          <option value="">Choose a lead or client…</option>
          <optgroup label="Clients">
            {clients.map((c) => (
              <option key={c.id} value={`client:${c.id}`}>
                {c.full_name} · {c.email}
              </option>
            ))}
          </optgroup>
          <optgroup label="Leads">
            {leads.map((l) => (
              <option key={l.id} value={`lead:${l.id}`}>
                {l.full_name} · {l.email}
              </option>
            ))}
          </optgroup>
        </Select>
        <Input
          label="Valid until"
          type="date"
          value={valid}
          onChange={(e) => setValid(e.target.value)}
          disabled={busy}
        />
        <BillingEditor
          value={fields}
          onChange={setFields}
          disabled={busy}
          preview={preview}
        />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </form>
    </Dialog>
  );
}
