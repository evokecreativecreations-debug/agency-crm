import { Eyebrow, H2 } from "@/components/ui/Typography";
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Buttons/actions shown on the right — e.g. the dashboard's Quick Actions row. */
  actions?: ReactNode;
}

/**
 * PageHeader — the top-of-page title block used on every dashboard page
 * (Leads, Clients, Invoices, etc.) and on the Dashboard itself for the
 * Quick Actions row. Keeps title placement/spacing identical everywhere.
 */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <Eyebrow className="mb-1 block">{eyebrow}</Eyebrow>}
        <H2>{title}</H2>
        {description && <p className="mt-1 text-sm text-slate">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
