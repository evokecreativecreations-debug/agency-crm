import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";

// Note: we're using the system font stack (defined in globals.css) instead
// of a Google Font. This keeps the app fast and avoids any dependency on
// an external font service just to load the page.

export const metadata: Metadata = {
  title: "Agency CRM",
  description: "Internal CRM — inquiries to invoices, in one place.",
  appleWebApp: {
    // This is what makes "Add to Home Screen" behave like a real app on iPhone
    // instead of just bookmarking the website.
    capable: true,
    statusBarStyle: "default",
    title: "Agency CRM",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        {/* Registers the service worker so the app can be installed and
            load its basic shell even with a flaky connection. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
