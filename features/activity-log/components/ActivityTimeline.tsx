import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Caption, Body } from "@/components/ui/Typography";
import type { ActivityLog } from "@/types/activity-log";
import {
  Activity,
  CheckCircle2,
  CirclePlus,
  FileEdit,
  Trash2,
} from "lucide-react";

interface ActivityTimelineProps {
  activities: ActivityLog[];
}

const ACTION_LABELS: Record<ActivityLog["action"], string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  status_changed: "Status changed",
  payment_recorded: "Payment recorded",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ActionIcon({ action }: { action: ActivityLog["action"] }) {
  switch (action) {
    case "created":
      return <CirclePlus className="h-4 w-4" aria-hidden="true" />;
    case "updated":
      return <FileEdit className="h-4 w-4" aria-hidden="true" />;
    case "deleted":
      return <Trash2 className="h-4 w-4" aria-hidden="true" />;
    case "status_changed":
      return <CheckCircle2 className="h-4 w-4" aria-hidden="true" />;
    case "payment_recorded":
      return <Activity className="h-4 w-4" aria-hidden="true" />;
  }
}

export function ActivityTimeline({
  activities,
}: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>

      <CardContent>
        {activities.length === 0 ? (
          <Body className="text-slate">
            No activity has been recorded for this client yet.
          </Body>
        ) : (
          <div className="relative">
            <div
              className="absolute bottom-2 left-[0.9375rem] top-2 w-px bg-line"
              aria-hidden="true"
            />

            <div className="space-y-6">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="relative flex gap-4"
                >
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-slate">
                    <ActionIcon action={activity.action} />
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <Body className="font-medium text-ink">
                        {ACTION_LABELS[activity.action]}
                      </Body>

                      <Caption>
                        {formatDateTime(activity.created_at)}
                      </Caption>
                    </div>

                    <Body className="mt-1 text-slate">
                      {activity.description}
                    </Body>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
