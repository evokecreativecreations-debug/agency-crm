import { DashboardShell } from "@/components/layout/DashboardShell";
import { InquiriesView } from "@/features/inquiries/components/InquiriesView";
import { getInquiries } from "@/features/inquiries/api";
import { createClient } from "@/lib/supabase/server";

/**
 * /inquiries — protected by proxy.ts (see PROTECTED_PREFIXES). Fetches
 * the initial list server-side so the page has data on first paint, then
 * hands off to <InquiriesView> for all interactivity (status changes,
 * manual entry).
 */
export default async function InquiriesPage() {
  const supabase = await createClient();
  const inquiries = await getInquiries(supabase);

  return (
    <DashboardShell pageTitle="Inquiries">
      <InquiriesView initialInquiries={inquiries} />
    </DashboardShell>
  );
}