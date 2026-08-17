import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { forwardRef, useId, type SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

/**
 * Select — native <select> styled to match Input/Textarea. Added in
 * Phase 3 for the Inquiries status dropdown; same label/helperText/error
 * API as the other form fields so it's a drop-in in any form.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error || helperText ? `${selectId}-desc` : undefined}
            className={cn(
              "h-10 w-full appearance-none rounded-[var(--radius-md)] border border-line-strong bg-surface pl-3 pr-9 text-sm text-ink transition-colors",
              "focus:border-signal focus:outline-none",
              error && "border-danger focus:border-danger",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
        </div>
        {(helperText || error) && (
          <p
            id={`${selectId}-desc`}
            className={cn("text-xs", error ? "text-danger" : "text-muted")}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";