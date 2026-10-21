"use client";
import { useEffect } from "react";
export function ReminderRunner() {
  useEffect(() => {
    let running = false;
    let disposed = false;
    async function collect() {
      if (disposed || running || document.visibilityState !== "visible") return;
      running = true;
      try {
        const response = await fetch("/api/reminders", { method: "POST" });
        if (response.ok && !disposed)
          window.dispatchEvent(new Event("crm-notifications-changed"));
      } catch {
        /* Offline: pending reminders stay in the database for the next visit. */
      } finally {
        running = false;
      }
    }
    void collect();
    const timer = window.setInterval(collect, 60000);
    document.addEventListener("visibilitychange", collect);
    return () => {
      disposed = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", collect);
    };
  }, []);
  return null;
}
