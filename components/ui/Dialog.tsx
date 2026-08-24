"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /**
   * Panel width. Defaults to "md" (max-w-md), the original and still
   * most common size — every dialog before Phase 10 relied on this
   * default and is completely unaffected. "lg" (max-w-2xl) is for
   * content that genuinely needs more room, like a data table (see
   * PaymentsCard's payment history).
   */
  size?: "md" | "lg";
}

const SIZE_CLASS: Record<NonNullable<DialogProps["size"]>, string> = {
  md: "max-w-md",
  lg: "max-w-2xl",
};

/**
 * Dialog — modal for focused tasks: confirmations, quick forms (e.g.
 * "New Lead" from Quick Actions). Built without an extra UI library to
 * keep dependencies minimal, but follows standard accessible-dialog
 * behavior: traps focus, closes on Escape or backdrop click, and returns
 * focus to the triggering element on close.
 *
 * Don't use Dialog for anything that needs its own URL/back-button
 * behavior (like a full project detail page) — use a route for that.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement;
      dialogRef.current?.focus();
    } else {
      (triggerRef.current as HTMLElement | null)?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full rounded-[var(--radius-xl)] bg-surface shadow-[var(--shadow-dialog)]",
          SIZE_CLASS[size],
          "focus:outline-none"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id="dialog-title" className="text-base font-semibold text-ink">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-slate">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-[var(--radius-sm)] p-1 text-slate transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}