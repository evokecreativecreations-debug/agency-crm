import type { SupabaseClient } from "@supabase/supabase-js";

export interface DashboardAnalytics {
  totalLeads: number;
  wonLeads: number;
  conversionRate: number;
  totalInvoiced: number;
  totalPaid: number;
  outstandingRevenue: number;
}

export async function getDashboardAnalytics(
  supabase: SupabaseClient
): Promise<DashboardAnalytics> {
  const [
    { data: leads, error: leadsError },
    { data: invoices, error: invoicesError },
    { data: payments, error: paymentsError },
  ] = await Promise.all([
    supabase.from("leads").select("status"),
    supabase.from("invoices").select("amount"),
    supabase.from("payments").select("amount"),
  ]);

  if (leadsError) {
    throw new Error(leadsError.message);
  }

  if (invoicesError) {
    throw new Error(invoicesError.message);
  }

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  const totalLeads = leads?.length ?? 0;

  const wonLeads =
    leads?.filter((lead) => lead.status === "won").length ?? 0;

  const conversionRate =
    totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

  const totalInvoiced =
    invoices?.reduce((sum, invoice) => {
      return sum + Number(invoice.amount ?? 0);
    }, 0) ?? 0;

  const totalPaid =
    payments?.reduce((sum, payment) => {
      return sum + Number(payment.amount ?? 0);
    }, 0) ?? 0;

  return {
    totalLeads,
    wonLeads,
    conversionRate,
    totalInvoiced,
    totalPaid,
    outstandingRevenue: Math.max(totalInvoiced - totalPaid, 0),
  };
}