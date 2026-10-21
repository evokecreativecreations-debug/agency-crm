import Link from "next/link";
import { ArrowUpRight, CalendarClock, FileText, FolderKanban, Inbox, Users, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

const actions = [
  { title: "Today", description: "Follow-ups and deadlines", href: "/today", icon: CalendarClock },
  { title: "Inquiries", description: "Review new requests", href: "/inquiries", icon: Inbox },
  { title: "Leads", description: "Keep sales moving", href: "/leads", icon: Users },
  { title: "Projects", description: "Manage client work", href: "/projects", icon: FolderKanban },
  { title: "Invoices", description: "Stay on top of billing", href: "/invoices", icon: FileText },
  { title: "Payments", description: "Track what comes in", href: "/payments", icon: Wallet },
];
export function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-3"><h2 id="quick-actions-heading" className="crm-section-title text-ink">Your everyday tools</h2><span className="text-xs text-slate">Quick access</span></div>
      <Card>
        <CardContent className="grid gap-1 p-2 sm:p-2 sm:grid-cols-2 xl:grid-cols-3">
          {actions.map((action) => <Link key={action.href} href={action.href} className="group flex items-center gap-3 rounded-[var(--radius-md)] p-3 transition-colors hover:bg-paper">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-line text-slate group-hover:border-signal-soft group-hover:bg-signal-soft group-hover:text-signal"><action.icon className="h-4 w-4" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="text-sm font-medium text-ink">{action.title}</p><p className="mt-1 text-xs leading-relaxed text-slate">{action.description}</p></div>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted group-hover:text-signal" aria-hidden="true" />
          </Link>)}
        </CardContent>
      </Card>
    </section>
  );
}
