import { createClient } from "@/lib/supabase/server";
import {
  createBillingPdf,
  type PdfDocumentInput,
} from "@/features/invoices/pdf";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const db = await createClient();
  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();
  if (authError || !user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { kind, id } = await params;
  if (!["invoice", "quotation"].includes(kind) || !/^[a-f0-9-]{36}$/i.test(id))
    return Response.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await db
    .from(kind === "invoice" ? "invoices" : "quotations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error)
    return Response.json({ error: "Unable to load document" }, { status: 503 });
  if (!data) return Response.json({ error: "Not found" }, { status: 404 });
  let recipientName = data.recipient_name,
    recipientEmail = data.recipient_email,
    paid = 0;
  if (kind === "invoice") {
    if (!recipientName || !recipientEmail) {
      const { data: project, error: projectError } = await db
        .from("projects")
        .select("client_id")
        .eq("id", data.project_id)
        .single();
      if (projectError || !project)
        return Response.json({ error: "Project unavailable" }, { status: 503 });
      const { data: client, error: clientError } = await db
        .from("clients")
        .select("full_name,email")
        .eq("id", project.client_id)
        .single();
      if (clientError || !client)
        return Response.json({ error: "Client unavailable" }, { status: 503 });
      recipientName = client.full_name;
      recipientEmail = client.email;
    }
    const { data: payments, error: paymentsError } = await db
      .from("payments")
      .select("amount")
      .eq("invoice_id", id);
    if (paymentsError)
      return Response.json({ error: "Payments unavailable" }, { status: 503 });
    paid = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  }
  const number =
    kind === "invoice" ? data.invoice_number : data.quotation_number;
  try {
    const pdf = await createBillingPdf({
      ...data,
      kind,
      number,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      line_items: data.line_items ?? [],
      discount_amount: Number(data.discount_amount ?? 0),
      tax_rate: Number(data.tax_rate ?? 0),
      deposit_amount: Number(data.deposit_amount ?? 0),
      amount: Number(data.amount),
      notes: data.notes ?? "",
      payment_terms: data.payment_terms ?? "",
      due_date: kind === "invoice" ? data.due_date : data.valid_until,
      paid,
    } as PdfDocumentInput);
    const filename = String(number)
      .replace(/[^A-Za-z0-9_-]/g, "_")
      .slice(0, 80);
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "Unable to generate PDF. Please retry." },
      { status: 500 },
    );
  }
}
