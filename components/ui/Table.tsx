import { cn } from "@/lib/utils";
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

/**
 * Table — reusable table primitives for lists of leads, clients, invoices,
 * etc. Compose them like plain HTML tables:
 *
 *   <Table>
 *     <TableHead><TableRow><TableHeaderCell>Name</TableHeaderCell>...
 *     <TableBody><TableRow><TableCell>...
 *
 * For an empty list, don't render an empty <Table> — use <EmptyState />
 * instead (see EmptyState.tsx).
 */
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-soft)]">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-paper/60", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("divide-y divide-line", className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("transition-colors hover:bg-paper/60 [tbody_&]:cursor-default", className)}
      {...props}
    />
  );
}

export function TableHeaderCell({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-line px-5 py-4 text-left text-xs font-medium uppercase tracking-[0.04em] text-slate",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-5 py-4 text-ink", className)} {...props} />;
}
