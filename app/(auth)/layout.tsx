import type { ReactNode } from "react";

/**
 * Layout for the public (auth) route group — deliberately has no
 * Sidebar/TopNav, just a centered surface on the app's paper background.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center bg-paper px-4">
      {children}
    </div>
  );
}
