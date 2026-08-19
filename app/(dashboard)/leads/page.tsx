import { DashboardShell } from "@/components/layout/DashboardShell";
import { LeadsView } from "@/features/leads/components/LeadsView";
import { getConvertedLeadIds } from "@/features/clients/api";
import { getLeads } from "@/features/leads/api";
import { createClient } from "@/lib/supabase/server";

/**
 * /leads — protected by proxy.ts (see PROTECTED_PREFIXES). Fetches the
 * initial list server-side, same pattern as /inquiries. Also fetches
 * which leads already have a client (Phase 5) so LeadsView can hide the
 * "Convert to Client" action and show a "Client" badge instead.
 */
export default async function LeadsPage() {
  const supabase = await createClient();
  const [leads, convertedLeadIds] = await Promise.all([
    getLeads(supabase),
    getConvertedLeadIds(supabase),
  ]);

  return (
    <DashboardShell pageTitle="Leads">
      <LeadsView initialLeads={leads} convertedLeadIds={[...convertedLeadIds]} />
    </DashboardShell>
  );
}