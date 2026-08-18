import { DashboardShell } from "@/components/layout/DashboardShell";
import { LeadsView } from "@/features/leads/components/LeadsView";
import { getLeads } from "@/features/leads/api";
import { createClient } from "@/lib/supabase/server";

/**
 * /leads — protected by proxy.ts (see PROTECTED_PREFIXES). Fetches the
 * initial list server-side, same pattern as /inquiries.
 */
export default async function LeadsPage() {
  const supabase = await createClient();
  const leads = await getLeads(supabase);

  return (
    <DashboardShell pageTitle="Leads">
      <LeadsView initialLeads={leads} />
    </DashboardShell>
  );
}