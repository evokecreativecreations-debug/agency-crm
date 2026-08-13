import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Spinner — use for short, indeterminate waits where you don't know the
 * shape of the content yet (e.g. "Signing in...", full-page initial load).
 * For lists/tables where you DO know the shape, prefer Skeleton instead.
 */
export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-slate">
      <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
