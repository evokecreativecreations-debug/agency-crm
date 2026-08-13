import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

/**
 * Button — the one component almost every feature will use.
 *
 * Variants:
 *   primary   — the signal-green fill. Use for the single main action on a
 *               screen (e.g. "Save changes", "Convert to Lead").
 *   secondary — neutral fill. Use for secondary but still important actions.
 *   outline   — bordered, transparent. Use alongside a primary button.
 *   ghost     — no border/fill until hovered. Use in tables/toolbars.
 *   destructive — red. Use only for delete/remove actions.
 *
 * Sizes: sm (compact rows/tables), md (default), lg (marketing-style CTAs,
 * rarely needed in this internal tool).
 */
const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-signal text-white hover:bg-signal-hover",
        secondary: "bg-ink text-white hover:bg-ink/90",
        outline: "border border-line-strong bg-surface text-ink hover:bg-paper",
        ghost: "bg-transparent text-ink hover:bg-paper",
        destructive: "bg-danger text-white hover:bg-danger/90",
      },
      size: {
        sm: "h-8 px-3 text-[0.8125rem] rounded-[var(--radius-sm)]",
        md: "h-10 px-4 text-sm rounded-[var(--radius-md)]",
        lg: "h-12 px-6 text-base rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  /** Shows a spinner and disables the button — use during form submits/API calls. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonStyles({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
