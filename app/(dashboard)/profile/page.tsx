import { DashboardShell } from "@/components/layout/DashboardShell";
import { Body, H2 } from "@/components/ui/Typography";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  return (
    <DashboardShell pageTitle="Profile">
      <div className="max-w-3xl space-y-6">
        <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-6">
          <H2>My Profile</H2>

          <Body className="mt-2 text-slate">
            Manage your account information and profile details.
          </Body>

          <ProfileForm
            email={user?.email ?? ""}
            fullName={fullName}
          />

          <div className="mt-8 border-t border-line pt-6">
            <div>
              <Body className="text-slate">User ID</Body>
              <p className="mt-1 break-all font-mono text-sm text-ink">
                {user?.id ?? "-"}
              </p>
            </div>

            <div className="mt-4">
              <Body className="text-slate">Account Created</Body>
              <p className="mt-1 text-ink">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}