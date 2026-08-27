import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Body, Caption, Eyebrow, H1 } from "@/components/ui/Typography";
import { ClientProjectsCard } from "@/features/projects/components/ClientProjectsCard";
import type { Client } from "@/types/client";
import type { Lead } from "@/types/lead";
import type { Project } from "@/types/project";
import type { Service } from "@/types/service";
import { Building2, Calendar, Mail, Phone, StickyNote, Users } from "lucide-react";
import { ActivityTimeline } from "@/features/activity-log/components/ActivityTimeline";
import type { ActivityLog } from "@/types/activity-log";

interface ClientDetailViewProps {
  client: Client;
  relatedLead: Lead | null;
  projects: Project[];
  services: Service[];
  activities: ActivityLog[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const LEAD_STATUS_LABEL: Record<Lead["status"], string> = {
  contacted: "Contacted",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost",
};

/**
 * ClientDetailView — read-only detail page for a single client. No
 * interactivity needed (clients have no editable status field in the
 * frozen schema), so this stays a plain server-renderable component —
 * no "use client" directive.
 */
export function ClientDetailView({
  client,
  relatedLead,
  projects,
  services,
  activities,
}: ClientDetailViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Client</Eyebrow>
        <H1 className="mt-1">{client.full_name}</H1>
        {client.company_name && (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate">
            <Building2 className="h-4 w-4" aria-hidden="true" />
            {client.company_name}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-slate" aria-hidden="true" />
              <Body>{client.email}</Body>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-slate" aria-hidden="true" />
              <Body>{client.phone || <Caption>Not provided</Caption>}</Body>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-slate" aria-hidden="true" />
              <Body>Client since {formatDate(client.created_at)}</Body>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Lead</CardTitle>
          </CardHeader>
          <CardContent>
            {relatedLead ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-slate" aria-hidden="true" />
                  <Body>{relatedLead.full_name}</Body>
                  <Badge variant="lead">{LEAD_STATUS_LABEL[relatedLead.status]}</Badge>
                </div>
                <Caption>Converted from a lead created {formatDate(relatedLead.created_at)}</Caption>
              </div>
            ) : (
              <Body className="text-slate">
                This client was added directly — no originating lead on file.
              </Body>
            )}
          </CardContent>
        </Card>
      </div>

      <ClientProjectsCard
  client={client}
  initialProjects={projects}
  services={services}
/>

<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <StickyNote className="h-4 w-4" aria-hidden="true" /> Notes
    </CardTitle>
  </CardHeader>

  <CardContent>
    {client.notes ? (
      <Body className="whitespace-pre-wrap">{client.notes}</Body>
    ) : (
      <Body className="text-slate">No notes yet.</Body>
    )}
  </CardContent>
</Card>

<ActivityTimeline activities={activities} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" aria-hidden="true" /> Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {client.notes ? (
            <Body className="whitespace-pre-wrap">{client.notes}</Body>
          ) : (
            <Body className="text-slate">No notes yet.</Body>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
