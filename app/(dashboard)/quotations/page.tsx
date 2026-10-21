import { DashboardShell } from "@/components/layout/DashboardShell";
import { QuotationsView } from "@/features/invoices/components/QuotationsView";
import { createClient } from "@/lib/supabase/server";
export default async function QuotationsPage() {
  const db = await createClient();
  const [quotes, leads, clients, projects] = await Promise.all([
    db.from("quotations").select("*").order("created_at", { ascending: false }),
    db.from("leads").select("id,full_name,email").order("full_name"),
    db.from("clients").select("id,lead_id,full_name,email").order("full_name"),
    db.from("projects").select("id,client_id,title").order("title"),
  ]);
  return (
    <DashboardShell pageTitle="Quotations">
      {[quotes, leads, clients, projects].some((r) => r.error) ? (
        <div role="alert" className="rounded-xl border border-line p-6">
          <h1 className="text-xl font-semibold">
            Quotations are not ready yet
          </h1>
          <p className="mt-2 text-sm text-slate">
            Apply the billing database update, then refresh. If already applied,
            check the database connection.
          </p>
        </div>
      ) : (
        <QuotationsView
          initialQuotes={quotes.data ?? []}
          leads={leads.data ?? []}
          clients={clients.data ?? []}
          projects={projects.data ?? []}
        />
      )}
    </DashboardShell>
  );
}
