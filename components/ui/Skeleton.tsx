import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * Skeleton — a placeholder shape shown while real data is loading.
 * Use this instead of a spinner whenever you already know the *shape* of
 * the content (a table row, a card, a line of text) — it feels faster and
 * avoids layout jump when the real content arrives.
 *
 * Example: <Skeleton className="h-4 w-32" /> for a line of text,
 *          <Skeleton className="h-10 w-10 rounded-full" /> for an avatar.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-sm)] bg-line", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/** A ready-made skeleton for a table row — use while a list is loading. */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full max-w-[140px]" />
        </td>
      ))}
    </tr>
  );
}
