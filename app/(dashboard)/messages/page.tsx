import { DashboardShell } from "@/components/layout/DashboardShell";
import { MessagesView } from "@/features/messages/components/MessagesView";

export default function MessagesPage() {
  return (
    <DashboardShell pageTitle="Messages">
      <MessagesView />
    </DashboardShell>
  );
}