import { Button } from "@/components/ui/Button";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

/**
 * EmptyState — shown instead of an empty table/list, e.g. "No leads yet."
 * Treats emptiness as an invitation to act (per the interface's voice),
 * not a dead end — always pair with a next step when one exists.
 */
export function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-line-strong px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-paper">
        <Icon className="h-5 w-5 text-slate" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description && <p className="max-w-sm text-sm text-slate">{description}</p>}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
