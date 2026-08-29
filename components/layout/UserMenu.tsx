"use client";

import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/useAuth";
import { LogOut, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const name = user?.email?.split("@")[0] ?? "Account";
  const initials = name.slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!open) return;

    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function navigate(path: string) {
    setOpen(false);
    router.push(path);
  }

  async function handleSignOut() {
    setSigningOut(true);

    await signOut();

    router.push("/login");
    router.refresh();
  }

  const menuItems = [
    {
      label: "Profile",
      icon: User,
      onClick: () => navigate("/profile"),
    },
    {
      label: "Settings",
      icon: Settings,
      onClick: () => navigate("/settings"),
    },
    {
      label: signingOut ? "Signing out…" : "Sign out",
      icon: LogOut,
      onClick: handleSignOut,
      destructive: true,
    },
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-medium text-white transition-opacity hover:opacity-90"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-52 rounded-[var(--radius-lg)] border border-line bg-surface py-1 shadow-[var(--shadow-dialog)]"
        >
          <div className="border-b border-line px-3 py-2">
            <p className="truncate text-sm font-medium text-ink">
              {name}
            </p>

            {user?.email && (
              <p className="truncate text-xs text-slate">
                {user.email}
              </p>
            )}
          </div>

          <div className="py-1">
            {menuItems.map((item) => (
              <button
                type="button"
                key={item.label}
                role="menuitem"
                disabled={item.label.includes("…")}
                onClick={item.onClick}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors disabled:opacity-60",
                  item.destructive
                    ? "text-danger hover:bg-danger-soft"
                    : "text-ink hover:bg-paper"
                )}
              >
                <item.icon
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}