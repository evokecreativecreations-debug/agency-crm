"use client";

import { PaymentsCard } from "@/features/payments/components/PaymentsCard";
import type { Invoice } from "@/types/invoice";
import { useState } from "react";

interface PaymentsCardStandaloneProps {
  invoice: Invoice;
}

/**
 * PaymentsCardStandalone — a thin client-side wrapper around PaymentsCard
 * for pages (like /payments) that render it directly from a Server
 * Component, with no stateful parent to sync into (unlike InvoicesCard,
 * which owns an `invoices` list it updates via onInvoiceChange).
 *
 * This wrapper exists because React Server Components cannot pass a
 * function prop (onInvoiceChange) directly from a Server Component to a
 * Client Component — functions aren't serializable across that boundary
 * and doing so throws at runtime. This wrapper supplies a real local
 * handler instead (keeping its own invoice copy in sync after payment
 * changes), without modifying PaymentsCard itself.
 */
export function PaymentsCardStandalone({ invoice: initialInvoice }: PaymentsCardStandaloneProps) {
  const [invoice, setInvoice] = useState(initialInvoice);
  return <PaymentsCard invoice={invoice} onInvoiceChange={setInvoice} />;
}