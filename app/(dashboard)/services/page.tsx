import { DashboardShell } from "@/components/layout/DashboardShell";
import { ServicesView } from "@/features/services/components/ServicesView";
import { getServices } from "@/features/services/api";
import { createClient } from "@/lib/supabase/server";

/** /services — the protected Services Catalog. */
export default async function ServicesPage() {
  const services = await getServices(await createClient());
  return <DashboardShell pageTitle="Services"><ServicesView initialServices={services} /></DashboardShell>;
}
