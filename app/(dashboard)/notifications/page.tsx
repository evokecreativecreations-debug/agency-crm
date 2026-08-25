import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Notifications
        </h1>

        <p className="text-sm text-muted-foreground">
          Stay up to date with activity across your CRM.
        </p>
      </div>

      <NotificationCenter />
    </div>
  );
}