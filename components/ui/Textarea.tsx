import { cn } from "@/lib/utils";
import { forwardRef, useId, type TextareaHTMLAttributes } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

/**
 * Textarea — multi-line text field. Same API as Input (label/helperText/
 * error) so they're always used consistently in forms. Use for things
 * like project notes, message bodies, revision feedback.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error || helperText ? `${textareaId}-desc` : undefined}
          className={cn(
            "w-full resize-y rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted transition-colors",
            "focus:border-signal focus:outline-none",
            error && "border-danger focus:border-danger",
            className
          )}
          {...props}
        />
        {(helperText || error) && (
          <p
            id={`${textareaId}-desc`}
            className={cn("text-xs", error ? "text-danger" : "text-muted")}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
