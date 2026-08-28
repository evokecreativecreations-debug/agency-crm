import type { SupabaseClient } from "@supabase/supabase-js";

export interface DashboardAnalytics {
  totalLeads: number;
  wonLeads: number;
  conversionRate: number;

  totalProjects: number;
  activeProjects: number;
  completedProjects: number;

  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;

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
    { data: projects, error: projectsError },
    { data: tasks, error: tasksError },
  ] = await Promise.all([
    supabase.from("leads").select("status"),
    supabase.from("invoices").select("amount"),
    supabase.from("payments").select("amount"),
    supabase.from("projects").select("status"),
    supabase.from("tasks").select("status"),
  ]);

  if (leadsError) throw new Error(leadsError.message);
  if (invoicesError) throw new Error(invoicesError.message);
  if (paymentsError) throw new Error(paymentsError.message);
  if (projectsError) throw new Error(projectsError.message);
  if (tasksError) throw new Error(tasksError.message);

  const totalLeads = leads?.length ?? 0;

  const wonLeads =
    leads?.filter((lead) => lead.status === "won").length ?? 0;

  const conversionRate =
    totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

  const totalProjects = projects?.length ?? 0;

  const activeProjects =
    projects?.filter((project) => project.status === "in_progress").length ??
    0;

  const completedProjects =
    projects?.filter((project) => project.status === "completed").length ??
    0;

  const totalTasks = tasks?.length ?? 0;

  const completedTasks =
    tasks?.filter((task) => task.status === "done").length ?? 0;

  const taskCompletionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const totalInvoiced =
    invoices?.reduce(
      (sum, invoice) => sum + Number(invoice.amount ?? 0),
      0
    ) ?? 0;

  const totalPaid =
    payments?.reduce(
      (sum, payment) => sum + Number(payment.amount ?? 0),
      0
    ) ?? 0;

  return {
    totalLeads,
    wonLeads,
    conversionRate,

    totalProjects,
    activeProjects,
    completedProjects,

    totalTasks,
    completedTasks,
    taskCompletionRate,

    totalInvoiced,
    totalPaid,
    outstandingRevenue: Math.max(totalInvoiced - totalPaid, 0),
  };
}