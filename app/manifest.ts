import type { MetadataRoute } from "next";

/**
 * PWA manifest. This is what makes "Add to Home Screen" work properly
 * on iPhone and turns this into an installable app instead of just a website.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agency CRM",
    short_name: "Agency CRM",
    description: "Internal CRM — inquiries to invoices, in one place.",
    // Points to "/" for now since the dashboard doesn't exist until Phase 1.
    // We'll update this to "/dashboard" once Authentication is built.
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#111111",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
