import { Badge, type BadgeProps } from "@/components/ui/Badge";
import type { InvoiceStatus } from "@/types/invoice";

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  partially_paid: "Partially Paid",
  paid: "Paid",
  overdue: "Overdue",
};

export const INVOICE_STATUS_BADGE_VARIANT: Record<InvoiceStatus, BadgeProps["variant"]> = {
  draft: "neutral",
  sent: "info",
  partially_paid: "warning",
  paid: "success",
  overdue: "danger",
};

/**
 * InvoiceStatusBadge — read-only status indicator, reusing existing
 * Badge variants (no new variant added). Used wherever an invoice's
 * status needs to be displayed without an inline editor — the editable
 * version is the Select in InvoicesCard.
 */
export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant={INVOICE_STATUS_BADGE_VARIANT[status]}>
      {INVOICE_STATUS_LABEL[status]}
    </Badge>
  );
}