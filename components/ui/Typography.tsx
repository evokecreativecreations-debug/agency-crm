import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

/**
 * Typography — the type scale for the whole app.
 *
 * Don't set font-size/weight directly in a feature component. Use one of
 * these instead, so every page shares the same rhythm. Full scale and
 * usage guidance is documented in DESIGN_SYSTEM.md.
 */

export function Display({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-[2.25rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink",
        className
      )}
      {...props}
    />
  );
}

export function H1({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-[1.875rem] leading-[1.2] font-semibold tracking-[-0.01em] text-ink",
        className
      )}
      {...props}
    />
  );
}

export function H2({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-2xl leading-[1.3] font-semibold text-ink", className)}
      {...props}
    />
  );
}

export function H3({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg leading-[1.4] font-semibold text-ink", className)}
      {...props}
    />
  );
}

export function BodyLg({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-base leading-relaxed text-ink", className)} {...props} />
  );
}

export function Body({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-relaxed text-ink", className)} {...props} />
  );
}

export function BodySm({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-[0.8125rem] leading-relaxed text-slate", className)} {...props} />
  );
}

/** Small uppercase label used above section headings — e.g. "LEADS", "INVOICES". */
export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "text-xs font-medium uppercase tracking-[0.06em] text-slate",
        className
      )}
      {...props}
    />
  );
}

/** Smallest text — timestamps, helper text, table meta. */
export function Caption({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-xs leading-normal text-muted", className)} {...props} />
  );
}

/** Monospace — use for invoice numbers, IDs, and money amounts so digits align. */
export function Mono({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("font-mono text-sm text-ink tabular-nums", className)} {...props} />
  );
}
