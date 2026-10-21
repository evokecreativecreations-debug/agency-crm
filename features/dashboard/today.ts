import type { Followup } from "@/types/followup";
export interface TodayTask {
  id: string;
  project_id: string;
  title: string;
  due_date: string | null;
  status: string;
  assigned_to: string | null;
  projects: { title: string } | null;
}
export interface TodayProject {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
}
export interface TodayInvoice {
  id: string;
  project_id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
  payments: { amount: number }[];
}
export function dayKey(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function buildToday(
  data: {
    followups: Followup[];
    tasks: TodayTask[];
    projects: TodayProject[];
    invoices: TodayInvoice[];
  },
  now: Date,
  timeZone: string,
) {
  const today = dayKey(now, timeZone);
  const followups = data.followups
    .filter((f) => f.status === "pending")
    .sort((a, b) => a.due_at.localeCompare(b.due_at));
  const dueFollowups = followups.filter(
    (f) => dayKey(new Date(f.due_at), timeZone) <= today,
  );
  const upcomingFollowups = followups.filter(
    (f) => dayKey(new Date(f.due_at), timeZone) > today,
  );
  const tasks = data.tasks
    .filter((t) => t.status !== "done" && t.due_date && t.due_date <= today)
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!));
  const projects = data.projects
    .filter(
      (p) =>
        !["completed", "on_hold"].includes(p.status) &&
        p.due_date &&
        p.due_date <= today,
    )
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!));
  const invoices = data.invoices
    .filter((i) => i.status !== "draft")
    .map((i) => ({
      ...i,
      balance: Math.max(
        0,
        Math.round(
          (Number(i.amount) -
            i.payments.reduce((s, p) => s + Number(p.amount), 0)) *
            100,
        ) / 100,
      ),
    }))
    .filter((i) => i.balance > 0)
    .sort((a, b) => (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"));
  return {
    today,
    dueFollowups,
    upcomingFollowups,
    tasks,
    projects,
    invoices,
    outstanding: invoices.reduce((s, i) => s + i.balance, 0),
  };
}
export type TodayData = ReturnType<typeof buildToday>;
