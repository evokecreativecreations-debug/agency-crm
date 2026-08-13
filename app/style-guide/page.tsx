"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";
import { Body, BodyLg, BodySm, Caption, Display, Eyebrow, H1, H2, H3, Mono } from "@/components/ui/Typography";
import { Inbox, Plus, UserPlus } from "lucide-react";
import { useState } from "react";

/**
 * /style-guide — a living reference for every component in the design
 * system. Not a business feature — this page exists purely so components
 * can be reviewed visually before we build real features on top of them.
 * Safe to keep around permanently as documentation, or remove later.
 */
export default function StyleGuidePage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl space-y-14">
        <div>
          <Eyebrow>Phase 0.5</Eyebrow>
          <Display className="mt-1">Design System</Display>
          <p className="mt-3 max-w-xl text-base text-slate">
            Every reusable component, token, and pattern this CRM is built
            from. Nothing on this page is a real feature — it&rsquo;s a reference.
          </p>
        </div>

        {/* ---------- Color Tokens ---------- */}
        <Section title="Color Tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {[
              ["Paper", "bg-paper", "border border-line"],
              ["Surface", "bg-surface", "border border-line"],
              ["Ink", "bg-ink", ""],
              ["Slate", "bg-slate", ""],
              ["Signal", "bg-signal", ""],
              ["Amber", "bg-amber", ""],
              ["Success", "bg-success", ""],
              ["Warning", "bg-warning", ""],
              ["Danger", "bg-danger", ""],
              ["Info", "bg-info", ""],
            ].map(([name, bg, extra]) => (
              <div key={name} className="space-y-1.5">
                <div className={`h-14 rounded-[var(--radius-md)] ${bg} ${extra}`} />
                <Caption>{name}</Caption>
              </div>
            ))}
          </div>
        </Section>

        {/* ---------- Typography ---------- */}
        <Section title="Typography">
          <Card>
            <CardContent className="space-y-4">
              <Display>Display — page hero titles</Display>
              <H1>H1 — rarely used, top-level page title</H1>
              <H2>H2 — section titles, PageHeader default</H2>
              <H3>H3 — card titles, subsections</H3>
              <BodyLg>Body Large — intro paragraphs, empty states</BodyLg>
              <Body>Body — default UI text, table cells, form labels</Body>
              <BodySm>Body Small — secondary/supporting text</BodySm>
              <div className="flex items-center gap-4">
                <Eyebrow>Eyebrow label</Eyebrow>
                <Caption>Caption / timestamp text</Caption>
                <Mono>INV-0012 — $1,240.00</Mono>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* ---------- Buttons ---------- */}
        <Section title="Buttons">
          <Card>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button loading>Saving…</Button>
                <Button disabled>Disabled</Button>
                <Button variant="outline">
                  <Plus className="h-4 w-4" /> With icon
                </Button>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* ---------- Inputs ---------- */}
        <Section title="Form Inputs">
          <Card>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Input label="Full name" placeholder="Jane Cooper" />
              <Input label="Email" type="email" placeholder="jane@company.com" helperText="We'll use this to send updates." />
              <Input label="With error" defaultValue="not-an-email" error="Enter a valid email address." />
              <Input label="Disabled" disabled placeholder="Can't edit this" />
              <Textarea
                label="Notes"
                placeholder="Add any context about this client…"
                className="sm:col-span-2"
              />
            </CardContent>
          </Card>
        </Section>

        {/* ---------- Badges ---------- */}
        <Section title="Badges">
          <Card>
            <CardContent className="space-y-4">
              <div>
                <Caption className="mb-2 block">Semantic</Caption>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="neutral">Draft</Badge>
                  <Badge variant="success">Paid</Badge>
                  <Badge variant="warning">Due Soon</Badge>
                  <Badge variant="danger">Overdue</Badge>
                  <Badge variant="info">In Review</Badge>
                </div>
              </div>
              <div>
                <Caption className="mb-2 block">Pipeline stage (signature motif)</Caption>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="inquiry">Inquiry</Badge>
                  <Badge variant="lead">Lead</Badge>
                  <Badge variant="client">Client</Badge>
                  <Badge variant="project">Project</Badge>
                  <Badge variant="invoice">Invoiced</Badge>
                  <Badge variant="paid">Paid</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* ---------- Cards ---------- */}
        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <Badge variant="success">On track</Badge>
              </CardHeader>
              <CardContent>
                <Mono className="text-2xl">$4,200.00</Mono>
                <Body className="mt-1 text-slate">+12% vs last month</Body>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm">View report</Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Project: Brand Refresh</CardTitle>
                <Badge variant="project">In Progress</Badge>
              </CardHeader>
              <CardContent>
                <Body>Client: Acme Co.</Body>
                <Body className="text-slate">Due in 3 days</Body>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ---------- Table ---------- */}
        <Section title="Table">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Stage</TableHeaderCell>
                <TableHeaderCell>Value</TableHeaderCell>
                <TableHeaderCell>Updated</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Acme Co.</TableCell>
                <TableCell><Badge variant="client">Client</Badge></TableCell>
                <TableCell><Mono>$2,500.00</Mono></TableCell>
                <TableCell><Caption>2 days ago</Caption></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Nova Studio</TableCell>
                <TableCell><Badge variant="lead">Lead</Badge></TableCell>
                <TableCell><Mono>—</Mono></TableCell>
                <TableCell><Caption>5 hrs ago</Caption></TableCell>
              </TableRow>
              <TableRowSkeleton columns={4} />
            </TableBody>
          </Table>
        </Section>

        {/* ---------- Loading & Empty States ---------- */}
        <Section title="Loading States">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-8">
              <Spinner />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title="Empty State">
          <EmptyState
            icon={Inbox}
            title="No inquiries yet"
            description="New inquiries from your website will show up here automatically."
            action={{ label: "Add manually", onClick: () => {} }}
          />
        </Section>

        {/* ---------- Dialog ---------- */}
        <Section title="Dialog">
          <Button onClick={() => setDialogOpen(true)}>
            <UserPlus className="h-4 w-4" /> Open example dialog
          </Button>
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="New Lead"
            description="Quickly add a lead you're following up with."
            footer={
              <>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Save</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="Full name" placeholder="Jane Cooper" />
              <Input label="Email" type="email" placeholder="jane@company.com" />
            </div>
          </Dialog>
        </Section>

        {/* ---------- PageHeader / Quick Actions pattern ---------- */}
        <Section title="Page Header + Quick Actions Pattern">
          <Card>
            <CardContent>
              <PageHeader
                eyebrow="Dashboard"
                title="Good morning, Rameez"
                description="Here's what's happening across your agency."
                actions={
                  <>
                    <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5" /> New Lead</Button>
                    <Button size="sm" variant="outline"><Plus className="h-3.5 w-3.5" /> New Client</Button>
                    <Button size="sm"><Plus className="h-3.5 w-3.5" /> New Project</Button>
                  </>
                }
              />
              <p className="text-sm text-slate">↑ This exact pattern is what the real Dashboard&rsquo;s Quick Actions row will use.</p>
            </CardContent>
          </Card>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}
