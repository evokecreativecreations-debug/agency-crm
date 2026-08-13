import { cn } from "@/lib/utils";
import { forwardRef, useId, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Text shown above the field. Always provide one — no placeholder-only fields (accessibility). */
  label?: string;
  /** Small helper text below the field, e.g. "We'll never share this." */
  helperText?: string;
  /** Validation error message. When set, the field turns red and this replaces helperText. */
  error?: string;
}

/**
 * Input — standard single-line text field.
 * Always pairs a visible <label> with the field (not just a placeholder),
 * so it stays usable for screen readers and doesn't lose context once
 * someone starts typing.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error || helperText ? `${inputId}-desc` : undefined}
          className={cn(
            "h-10 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-muted transition-colors",
            "focus:border-signal focus:outline-none",
            error && "border-danger focus:border-danger",
            className
          )}
          {...props}
        />
        {(helperText || error) && (
          <p
            id={`${inputId}-desc`}
            className={cn("text-xs", error ? "text-danger" : "text-muted")}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
