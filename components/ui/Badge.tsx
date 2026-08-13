import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

/**
 * Badge — small status pill, always paired with a colored dot.
 *
 * This dot+label pattern is used consistently everywhere status appears
 * (tables, cards, sidebar) — see DESIGN_SYSTEM.md "Signature Element."
 * It's what makes it possible to scan a busy list and read status at a
 * glance without reading every word.
 *
 * Two kinds of variants:
 *  - Semantic (neutral/success/warning/danger/info) — generic states like
 *    "Active", "Overdue", "Failed".
 *  - Stage (inquiry/lead/client/project/invoice/paid) — matches the exact
 *    pipeline stage colors, so the same client is the same color everywhere.
 */
const badgeStyles = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-paper text-slate border border-line-strong",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        danger: "bg-danger-soft text-danger",
        info: "bg-info-soft text-info",
        inquiry: "bg-paper text-stage-inquiry border border-line-strong",
        lead: "bg-info-soft text-stage-lead",
        client: "bg-signal-soft text-stage-client",
        project: "bg-[#f2edfb] text-stage-project",
        invoice: "bg-warning-soft text-stage-invoice",
        paid: "bg-success-soft text-stage-paid",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

const dotColor: Record<string, string> = {
  neutral: "bg-slate",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  inquiry: "bg-stage-inquiry",
  lead: "bg-stage-lead",
  client: "bg-stage-client",
  project: "bg-stage-project",
  invoice: "bg-stage-invoice",
  paid: "bg-stage-paid",
};

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {}

export function Badge({ className, variant = "neutral", children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeStyles({ variant }), className)} {...props}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[variant ?? "neutral"])} aria-hidden="true" />
      {children}
    </span>
  );
}
