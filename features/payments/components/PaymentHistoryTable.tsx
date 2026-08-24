import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { Caption } from "@/components/ui/Typography";
import type { Payment, PaymentMethod } from "@/types/payment";
import { Receipt, Pencil, Trash2 } from "lucide-react";

interface PaymentHistoryTableProps {
  payments: Payment[];
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  stripe: "Stripe",
  paypal: "PayPal",
  other: "Other",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * PaymentHistoryTable — presentational list of payments recorded against
 * an invoice. Purely display + row actions; all state and API calls live
 * in the parent (PaymentsCard), same split used by every list/detail
 * pair elsewhere in the app.
 */
export function PaymentHistoryTable({ payments, onEdit, onDelete }: PaymentHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No payments recorded yet"
        description="Add a payment once the client sends money for this invoice."
      />
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Date</TableHeaderCell>
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Method</TableHeaderCell>
          <TableHeaderCell>Notes</TableHeaderCell>
          <TableHeaderCell>Actions</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              <Caption>{formatDate(payment.paid_at)}</Caption>
            </TableCell>
            <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
            <TableCell>{PAYMENT_METHOD_LABEL[payment.payment_method]}</TableCell>
            <TableCell>
              {payment.notes ? (
                <p className="max-w-[16rem] truncate text-ink" title={payment.notes}>
                  {payment.notes}
                </p>
              ) : (
                <Caption>—</Caption>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Edit payment from ${formatDate(payment.paid_at)}`}
                  onClick={() => onEdit(payment)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete payment from ${formatDate(payment.paid_at)}`}
                  onClick={() => onDelete(payment)}
                  className="text-danger hover:bg-danger-soft"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}