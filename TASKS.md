# TASKS.md — Live Roadmap Tracker

Legend: ✅ Done · 🔄 In Progress · ⬜ Not Started

---

## Phase 0 — Foundation Setup ✅
- ✅ Create Next.js project (TypeScript + App Router)
- ✅ Install & configure Tailwind CSS
- ✅ Set up approved folder structure (`app/`, `features/`, `components/`, `lib/`, `types/`)
- ✅ Add Supabase client setup (browser + server) — placeholders, no live project connected yet
- ✅ Add PWA manifest + iOS meta tags + service worker
- ✅ Create `.env.local.example`
- ✅ Create `PROJECT.md`, `CHANGELOG.md`, `TASKS.md`
- ✅ Verify locally: project builds and runs with no errors
- ⬜ **Rameez creates a real Supabase project and provides keys**
- ⬜ **Rameez confirms Phase 0 complete**

## Phase 0.5 — Design System Foundation 🔄
- ✅ Color, typography, spacing, radius, and shadow tokens (`app/globals.css`)
- ✅ Typography components (Display, H1–H3, Body variants, Eyebrow, Caption, Mono)
- ✅ Button (5 variants, 3 sizes, loading state)
- ✅ Input + Textarea (label, helper text, error state)
- ✅ Card (Header, Title, Content, Footer)
- ✅ Badge (semantic + pipeline-stage variants — signature dot pattern)
- ✅ Table (Head, Body, Row, HeaderCell, Cell) + row skeleton
- ✅ Loading states: Skeleton, Spinner
- ✅ EmptyState
- ✅ Dialog (accessible, no external dependency)
- ✅ Sidebar (responsive: fixed desktop / drawer mobile)
- ✅ TopNav (hamburger, notification bell UI, account avatar)
- ✅ DashboardShell (responsive layout wrapper)
- ✅ PageHeader (title + Quick Actions pattern)
- ✅ `/style-guide` showcase page — every token/component in one place
- ✅ `/style-guide/layout-preview` — Sidebar + TopNav + PageHeader live example
- ✅ `DESIGN_SYSTEM.md` documentation
- ✅ Verified: clean production build, all routes return HTTP 200
- ⬜ **Rameez reviews `/style-guide` and approves**

## Phase 1 — Dashboard Layout & Navigation ✅
- ✅ Responsive Sidebar (desktop fixed + collapsible, mobile drawer)
- ✅ TopNav (hamburger, breadcrumbs, search bar UI, notification button, user menu)
- ✅ DashboardShell (responsive wrapper, auto active-route highlighting)
- ✅ Navigation config in `lib/navigation.ts`
- ✅ Breadcrumbs (auto-derived from URL)

## Phase 2 — Authentication 🔄
- ✅ Supabase Auth wired up (`lib/supabase/client.ts` / `server.ts`, already present from Phase 0)
- ✅ `AuthProvider` + `useAuth()` hook (`features/auth/`)
- ✅ Login page (`/login`)
- ✅ Logout (real sign-out wired into `UserMenu`)
- ✅ Route protection via `proxy.ts` (protected dashboard paths + public-only `/login`)
- ✅ Session persistence (Supabase cookie-based SSR auth)
- ✅ Loading state (`isLoading` on `useAuth()`)
- ✅ Minimal protected `/dashboard` page to confirm the flow end-to-end
- ✅ Verified: clean production build, zero errors
- ⬜ **Rameez creates a real user in Supabase Auth and confirms login/logout work live**
- ⬜ **Rameez approves Phase 2**

## Phase 3 — Inquiries 🔄
- ✅ SQL migration: `inquiries` table with RLS (authenticated-only read/write, no public policy)
- ✅ `types/inquiry.ts` — shared type definitions
- ✅ `features/inquiries/api.ts` — data-access functions
- ✅ `components/ui/Select.tsx` — added to design system (status dropdown)
- ✅ Manual inquiry entry (`NewInquiryDialog`)
- ✅ Public API endpoint for website contact form (`POST /api/inquiries`, shared-secret + service-role pattern, CORS-ready)
- ✅ Inquiries list + status management (`/inquiries`, `InquiriesView`)
- ✅ Verified: `npm run build`, `npx tsc --noEmit`, `npm run lint` all pass with zero errors
- ✅ Verified: API endpoint correctly rejects missing/wrong secret (401) and missing fields (400)
- ⬜ **Rameez runs the migration on the real Supabase project** (`supabase/migrations/20260813120000_create_inquiries_table.sql`)
- ⬜ **Rameez sets `SUPABASE_SERVICE_ROLE_KEY`, `INQUIRY_API_SECRET`, `WEBSITE_ORIGIN` in `.env.local`**
- ⬜ **Rameez wires the live website's contact form to POST to `/api/inquiries`**
- ⬜ **Rameez approves Phase 3**

## Phase 4 — Leads 🔄
- ✅ SQL migration: `leads` table with RLS (authenticated-only, same pattern as `inquiries`), `inquiry_id` FK (nullable, `on delete set null`)
- ✅ `types/lead.ts` — shared type definitions
- ✅ `features/leads/api.ts` — `getLeads`, `createLead`, `updateLeadStatus`, `convertInquiryToLead`
- ✅ Convert inquiry → lead (`ConvertInquiryDialog`, launched from `/inquiries`)
- ✅ Automatic inquiry status update to `converted_to_lead` on successful conversion (single action, reuses `updateInquiryStatus` from Phase 3)
- ✅ Lead status management (`/leads`, `LeadsView`, optimistic updates — Contacted/Negotiating/Won/Lost)
- ✅ Reused existing components throughout (Table, Badge, Select, Dialog, Input, Textarea, Button, EmptyState, PageHeader) — no new design-system components needed
- ✅ Verified: `npm run build`, `npx tsc --noEmit`, `npm run lint` all pass with zero errors
- ⬜ **Rameez runs the migration on the real Supabase project** (`supabase/migrations/20260814090000_create_leads_table.sql`)
- ⬜ **Rameez approves Phase 4**

## Phase 5 — Clients 🔄
- ✅ SQL migration: `clients` table with RLS (authenticated-only, same pattern as `inquiries`/`leads`), `lead_id` FK (nullable, `on delete set null`), `unique` constraint on `lead_id` to prevent duplicate conversions at the DB level
- ✅ `types/client.ts` — shared type definitions
- ✅ `features/clients/api.ts` — `getClients`, `getClientById`, `getConvertedLeadIds`, `convertLeadToClient` (app-level duplicate-conversion guard + DB constraint as second line of defense)
- ✅ `features/leads/api.ts` — added `getLeadById` (needed for the Client Detail page's Related Lead card)
- ✅ Convert lead → client (`ConvertLeadDialog`, launched from `/leads`)
- ✅ Automatic lead status update to `won` on successful conversion (reuses `updateLeadStatus` from Phase 4, same pattern as Phase 4's inquiry conversion)
- ✅ Clients list with working search (name/company/email, client-side filter using the existing `SearchBar` component) and empty states (no clients yet vs. no search matches)
- ✅ Client detail page (`/clients/[id]`) — contact details, notes, related lead card, metadata; 404s via `notFound()` for an unknown ID
- ✅ Loading states for both `/clients` and `/clients/[id]` via Next.js's built-in `loading.tsx` convention, reusing `Skeleton`/`TableRowSkeleton`
- ✅ Reused existing components throughout — no new design-system components were needed
- ✅ Verified: `npm run build`, `npx tsc --noEmit`, `npm run lint` all pass with zero errors
- ⬜ **Rameez runs the migration on the real Supabase project** (`supabase/migrations/20260815090000_create_clients_table.sql`)
- ⬜ **Rameez approves Phase 5**

## Phase 6 — Projects 🔄
- ✅ SQL migration: `projects` table with RLS (authenticated-only, same pattern as prior modules), `client_id` FK **not null** (first required FK in the schema — every project must belong to exactly one client), `on delete cascade`
- ✅ `types/project.ts` — `Project`, `ProjectStatus`, `NewProjectInput`, `ProjectUpdateInput`
- ✅ `features/projects/api.ts` — `getProjects`, `getProjectsByClientId`, `getProjectById`, `createProject`, `updateProject`, `updateProjectStatus` (thin wrapper over `updateProject`, avoids duplicated update logic)
- ✅ `features/projects/components/NewProjectDialog.tsx` — one reusable dialog for both entry points (client picker from `/projects`, pre-locked client from a Client's detail page) rather than two separate components
- ✅ `features/projects/components/ProjectsView.tsx` — list, inline status Select (optimistic update, same pattern as `LeadsView`), empty state
- ✅ `features/projects/components/ProjectDetailView.tsx` — read-only detail page (client link, timeline, description); status shown as a Badge, not editable here
- ✅ `features/projects/components/ClientProjectsCard.tsx` — the "Projects" section embedded on a Client's detail page (Client Integration requirement)
- ✅ Client Integration: creating a project from a Client's detail page automatically attaches it to that client (`lockedClientId`)
- ✅ Routing: `/projects`, `/projects/[id]`, plus `loading.tsx` for both (Next.js built-in convention, reusing `Skeleton`/`TableRowSkeleton`)
- ✅ Reused existing components throughout (PageHeader, Table, Button, Badge, Dialog, Select, Typography, EmptyState, Input, Textarea) — no new design-system components, no redesign
- ✅ Verified: `npm run build`, `npx tsc --noEmit`, `npm run lint` all pass with zero errors
- ⬜ **Rameez runs the migration on the real Supabase project** (`supabase/migrations/20260816090000_create_projects_table.sql`)
- ⬜ **Rameez approves Phase 6**

## Phase 7 — Tasks 🔄
- ✅ SQL migration: `tasks` table with RLS (authenticated-only, same pattern as prior modules), `project_id` FK **not null**, `on delete cascade`; includes `assigned_to` (nullable FK to `auth.users`, unused until team members exist)
- ✅ `types/task.ts` — `Task`, `TaskStatus`, `NewTaskInput`, `UpdateTaskInput` (no `priority`/`updated_at` — not in the frozen blueprint schema)
- ✅ `features/tasks/api.ts` — `getTasks(projectId)`, `getTaskById`, `createTask`, `updateTask`, `updateTaskStatus` (thin wrapper over `updateTask`); no `deleteTask` — the blueprint specifies no delete policy for any table so far
- ✅ `features/tasks/components/TaskFormDialog.tsx` — one reusable dialog for both create and edit (same approach as `NewProjectDialog`)
- ✅ `features/tasks/components/ProjectTasksCard.tsx` — the "Tasks" section embedded on a Project's detail page: list, inline status Select (optimistic update), edit-on-click, empty state
- ✅ Project Integration: tasks always stay linked to their project; no standalone `/tasks` route added (matches the frozen nav config — tasks aren't a top-level module)
- ✅ Reused existing components throughout (Card, Button, Select, Dialog, Input, Textarea, Typography) — no new design-system components, no redesign
- ✅ Verified: `npm run build`, `npx tsc --noEmit`, `npm run lint` all pass with zero errors
- ⬜ **Rameez runs the migration on the real Supabase project** (`supabase/migrations/20260818090000_create_tasks_table.sql`)
- ⬜ **Rameez approves Phase 7**

> Note: `supabase/migrations/20260817090000_create_invoices_table.sql` also exists from a mislabeled earlier request — it's correct, blueprint-compliant Phase 9 content, just created out of order. It isn't referenced by any code yet and won't be until Phase 9 actually begins.
## Phase 8 — Revisions 🔄
- ✅ SQL migration: `revisions` table with RLS (authenticated-only, same pattern as prior modules), `project_id` FK **not null**, `on delete cascade`, `unique(project_id, round_number)` to prevent round-number collisions
- ✅ `types/revision.ts` — `Revision`, `RevisionStatus`, `NewRevisionInput`, `UpdateRevisionInput` (single `feedback` field + `round_number`, matching the frozen schema — no separate title/notes, no requested_at/completed_at/updated_at)
- ✅ `features/revisions/api.ts` — `getRevisions(projectId)` (oldest-first, for a readable history), `getRevisionById`, `createRevision` (auto-assigns the next `round_number` per project), `updateRevision`, `updateRevisionStatus` (thin wrapper over `updateRevision`)
- ✅ `features/revisions/components/RevisionFormDialog.tsx` — one reusable dialog for both create and edit (same approach as `TaskFormDialog`/`NewProjectDialog`)
- ✅ `features/revisions/components/ProjectRevisionsCard.tsx` — the "Revisions" section embedded on a Project's detail page: full history list, inline status Select (optimistic update), click-to-edit feedback, empty state
- ✅ Project Integration: revisions always stay linked to their project; no standalone `/revisions` route added (matches the frozen nav config, same reasoning as Tasks in Phase 7)
- ✅ Reused existing components throughout (Card, Button, Select, Dialog, Textarea, Typography) — no new design-system components, no redesign
- ✅ Verified: `npm run build`, `npx tsc --noEmit`, `npm run lint` all pass with zero errors
- ⬜ **Rameez runs the migration on the real Supabase project** (`supabase/migrations/20260819090000_create_revisions_table.sql`)
- ⬜ **Rameez approves Phase 8**

## Phase 9 — Invoices 🔄
- ✅ SQL migration reused from Phase 7's aside: `invoices` table with RLS (authenticated-only, same pattern as prior modules), `project_id` FK **not null**, `on delete cascade`, `unique` `invoice_number`
- ✅ `types/invoice.ts` — `Invoice`, `InvoiceStatus`, `NewInvoiceInput`, `UpdateInvoiceInput` (amount + due_date only, matching the frozen schema — no issued_date/notes column)
- ✅ `features/invoices/api.ts` — `getInvoices(projectId)`, `getInvoiceById`, `createInvoice` (auto-generates the next sequential `INV-XXXX` number, globally across the agency), `updateInvoice`, `updateInvoiceStatus` (thin wrapper over `updateInvoice`)
- ✅ `features/invoices/components/InvoiceStatusBadge.tsx` — read-only status indicator, reused Badge variants, exports the label/variant maps
- ✅ `features/invoices/components/InvoiceFormDialog.tsx` — one reusable dialog for both create and edit (amount, due date); amount validated `> 0` client-side
- ✅ `features/invoices/components/InvoicesCard.tsx` — the "Invoices" section embedded on a Project's detail page: list, inline status Select (optimistic update) + status badge, click-to-edit amount/due date, empty state
- ✅ Project Integration: invoices always stay linked to their project; card placed below Tasks and Revisions on `/projects/[id]`, no standalone `/invoices` route added (same reasoning as Tasks/Revisions)
- ✅ Reused existing components throughout (Card, Button, Select, Dialog, Input, Badge, Typography) — no new design-system components, no redesign
- ✅ Verified: `npm run build`, `npx tsc --noEmit`, `npm run lint` all pass with zero errors
- ⬜ **Rameez runs the migration on the real Supabase project** (`supabase/migrations/20260817090000_create_invoices_table.sql`)
- ⬜ **Rameez approves Phase 9**
## Phase 10 — Payments 🔄
- ✅ SQL migration: `payments` table with RLS, `invoice_id` FK **not null**, `on delete cascade`; the **first module with a delete policy** (correcting a mis-entered payment is a real need, unlike arbitrary deletion elsewhere)
- ✅ `types/payment.ts` — `Payment`, `PaymentMethod`, `NewPaymentInput`, `UpdatePaymentInput`
- ✅ `features/payments/api.ts` — `getPayments(invoiceId)`, `getPaymentById`, `createPayment`, `updatePayment`, `deletePayment`, plus an internal `syncInvoiceStatus` that reuses `getInvoiceById`/`updateInvoiceStatus` from Phase 9 instead of duplicating invoice logic
- ✅ Automatic invoice status sync after every create/update/delete: 0 paid → sent (draft stays draft), partial → `partially_paid`, full → `paid`
- ✅ Payments can never exceed an invoice's remaining balance — enforced both server-side (`api.ts`, before any write) and client-side (`PaymentFormDialog`, before submit)
- ✅ `features/payments/components/PaymentHistoryTable.tsx` — presentational list with edit/delete row actions
- ✅ `features/payments/components/PaymentFormDialog.tsx` — one reusable dialog for both create and edit
- ✅ `features/payments/components/PaymentsCard.tsx` — totals (Invoice Total / Total Paid / Remaining Balance), history, add/edit/delete, with a delete-confirmation step
- ✅ Invoice Integration: a "Payments" button per invoice row on `InvoicesCard` opens the above in a modal
- ✅ `components/ui/Dialog.tsx` — added an optional `size` prop (`"md"` default, `"lg"` for the payments modal) — backward compatible, every other dialog in the app is unaffected
- ✅ `app/(dashboard)/payments/page.tsx` + `loading.tsx` — top-level `/payments` route (was missing, causing a 404 despite `lib/navigation.ts` already linking to it)
- ✅ `features/payments/components/PaymentsCardStandalone.tsx` — thin client wrapper so `PaymentsCard`'s required `onInvoiceChange` prop can be supplied safely from a Server Component page (React Server Components can't pass functions as props to Client Components)
- ✅ Verified: `npm run build`, `npx tsc --noEmit`, `npm run lint` all pass with zero errors
- ⬜ **Rameez runs the migration on the real Supabase project** (`supabase/migrations/20260821090000_create_payments_table.sql`)
- ⬜ **Rameez approves Phase 10**

Phase 11 — Services Catalog 🔄
- ✅ SQL migration: `services` table with authenticated-only RLS, plus the blueprint-approved optional `projects.service_id` link
- ✅ `types/service.ts` and `features/services/api.ts` — catalog types and server/browser-safe data access
- ✅ `/services` catalog — add, edit, search, retire, and reactivate services without deleting historical records
- ✅ New-project service picker — active catalog services can be linked to a project from either project creation entry point
- ⬜ **Rameez runs the migration on the real Supabase project** (`supabase/migrations/20260822090000_create_services_table.sql`)
- ⬜ **Rameez approves Phase 11**

## Phase 12 — Activity Log ⬜
- ⬜ Core logging system (foundation for Notifications, Messages, Timeline)

## Phase 13 — Notifications ⬜
- ⬜ Notification center + bell icon

## Phase 14 — Messages ⬜
- ⬜ Conversation history + reply sending (needs email provider)

## Phase 15 — File Management ⬜
- ⬜ Upload/attach/view files

## Phase 16 — Dashboard Analytics & Quick Actions ⬜
- ⬜ Revenue/conversion widgets + shortcut buttons

## Phase 17 — Client Activity Timeline ⬜
- ⬜ Timeline view on client detail page

## Phase 18 — Dashboard Polish ⬜
- ⬜ Final widgets, recent activity, deadlines

## Phase 19 — Full PWA Testing ⬜
- ⬜ iPhone install test
- ⬜ Responsive QA pass on all modules

---

**Rule:** Each phase requires Rameez's explicit confirmation before the next one begins. No skipping ahead.
