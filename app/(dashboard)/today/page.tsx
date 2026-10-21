import { DashboardShell } from "@/components/layout/DashboardShell";
import { TodayView } from "@/features/dashboard/components/TodayView";
import {
  buildToday,
  type TodayTask,
  type TodayProject,
  type TodayInvoice,
} from "@/features/dashboard/today";
import type { Followup } from "@/types/followup";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function TodayPage() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login");
  const results = await Promise.all([
    db
      .from("lead_followups")
      .select("*,leads(full_name,email,last_contacted_at)")
      .eq("status", "pending")
      .order("due_at"),
    db
      .from("tasks")
      .select("*,projects(title)")
      .neq("status", "done")
      .or(`assigned_to.is.null,assigned_to.eq.${user.id}`)
      .not("due_date", "is", null),
    db
      .from("projects")
      .select("id,title,due_date,status")
      .not("due_date", "is", null),
    db
      .from("invoices")
      .select(
        "id,project_id,invoice_number,amount,status,due_date,payments(amount)",
      )
      .neq("status", "draft"),
  ]);
  const error = results.find((r) => r.error)?.error;
  const timeZone = process.env.CRM_TIME_ZONE || "Asia/Karachi";
  return (
    <DashboardShell pageTitle="Today">
      {error ? (
        <div role="alert" className="rounded-xl border border-line p-6">
          <h1 className="text-xl font-semibold">Today is not ready yet</h1>
          <p className="mt-2 text-sm text-slate">
            Apply the follow-up and billing database update, then refresh this
            page. If the update is already applied, check the database
            connection.
          </p>
        </div>
      ) : (
        <TodayView
          timeZone={timeZone}
          data={buildToday(
            {
              followups: results[0].data as Followup[],
              tasks: results[1].data as TodayTask[],
              projects: results[2].data as TodayProject[],
              invoices: results[3].data as TodayInvoice[],
            },
            new Date(),
            timeZone,
          )}
        />
      )}
    </DashboardShell>
  );
}
