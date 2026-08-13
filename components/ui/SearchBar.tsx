"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

/**
 * SearchBar — the global search field in TopNav.
 * UI only for now — wiring it up to actually search across Leads/Clients/
 * Projects/etc. is a future feature, not built yet (needs a decision on
 * whether it searches one module at a time or everything at once).
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative w-full max-w-sm", containerClassName)}>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="search"
          placeholder="Search…"
          aria-label="Search"
          className={cn(
            "h-9 w-full rounded-[var(--radius-md)] border border-line-strong bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-muted transition-colors",
            "focus:border-signal focus:bg-surface focus:outline-none",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
SearchBar.displayName = "SearchBar";
