import { DashboardShell } from "@/components/layout/DashboardShell";
import { SettingsView } from "@/features/settings/components/SettingsView";

export default function SettingsPage() {
  return (
    <DashboardShell pageTitle="Settings">
      <SettingsView />
    </DashboardShell>
  );
}