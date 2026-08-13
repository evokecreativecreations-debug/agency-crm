# Agency CRM — Complete Project Blueprint (v2)
**Prepared for:** Rameez
**Purpose:** Full plan to review and approve before any code is written.

> ⚠️ Nothing in this document has been built yet. This is the plan only. Once you approve it (or ask for changes), we start Phase 0.

**Changelog (v1 → v2):** Added Messages module, Notifications system, Activity Log, Services table, File Management module, Dashboard Analytics, Client Activity Timeline, and a Quick Actions dashboard section. Everything from v1 is unchanged — these are additions only.

---

## 0. Assumptions (Please Confirm or Correct)

| Item | Assumption | Why |
|---|---|---|
| Framework | Next.js (App Router) | Works great with Supabase, supports PWA, and is beginner-friendly to explain |
| Database & Auth | Supabase (Postgres + Auth + Row Level Security) | You already listed this in your rules |
| Styling | Tailwind CSS | You already listed this in your rules |
| Hosting | Vercel (recommended, but not final) | Easiest free hosting for Next.js, works well with PWA |
| Users of this CRM | You + your internal team (not your public clients) | You didn't mention clients needing logins — confirm if wrong |
| Website integration | Your existing website stays 100% untouched. Its contact form will send data to a secure API endpoint we build in this CRM | Per your instruction not to rebuild the website |
| Currency/Invoicing | Single currency to start (tell me which one) | Keeps invoicing simple at first |

**🔴 Please confirm/correct these before we lock the blueprint.**

---

## 1. Software Requirements Specification (SRS)

### 1.1 Project Overview
A private, internal web-based CRM for a creative/design agency that manages the full client lifecycle:

```
Website Inquiry → Lead → Client → Project → Tasks → Revisions → Invoice → Payment → Completed Project
```

It will be installable as a Progressive Web App (PWA) so it behaves like a native app on iPhone (and Android/desktop too).

### 1.2 Goals
- Centralize all inquiries, leads, clients, and projects in one dashboard.
- Replace scattered spreadsheets/WhatsApp/email tracking.
- Give a clear, premium, professional interface for daily agency operations.
- Allow invoice generation and payment tracking without a separate accounting tool (at least initially).
- Be usable comfortably on a phone (PWA), not just desktop.

### 1.3 Out of Scope (For Now)
- Rebuilding the public marketing website.
- Public client-facing login/portal (can be a future phase — added to TODO list).
- Multi-currency invoicing (future TODO).
- Multi-agency / multi-tenant support (this is for your agency only).
- Payment gateway auto-charging (we track payments, we don't process live card payments — future TODO if needed).

### 1.4 User Roles (Phase 1 Scope)

| Role | Access |
|---|---|
| **Admin (You)** | Full access to everything |
| **Team Member** | Access to assigned projects/tasks only (future-ready, but for now can start as same as Admin if you're a solo/small team — confirm team size) |

### 1.5 Core Modules
1. Authentication (secure login for your team)
2. Inquiries (from website + manual entry)
3. Leads (qualified inquiries being followed up)
4. Clients (converted leads)
5. Projects (work being done for a client)
6. Tasks (steps inside a project)
7. Revisions (feedback/revision rounds per project)
8. Invoices (billing tied to a project)
9. Payments (tracking money received against invoices)
10. Dashboard (overview of everything — the "home base")
11. **Messages** (email conversation history per lead/client, and replies sent from the CRM)
12. **Notifications** (in-app notification center for things that need your attention)
13. **Activity Log** (a running history of every important action taken, across every module)
14. **Services** (a catalog of the services your agency offers, used when creating projects/invoices)
15. **File Management** (upload, store, and attach files to leads/clients/projects)
16. **Dashboard Analytics** (monthly revenue, outstanding revenue, lead-to-client conversion rate)
17. **Client Activity Timeline** (a single scrollable history of everything that happened with one client)

> Modules 11–17 were added after your latest feedback. Modules 1–10 (from the original blueprint) are unchanged.

### 1.6 Non-Functional Requirements
- **Security:** Supabase Auth + Row Level Security on every table. No data visible to anyone not logged in.
- **Responsiveness:** Fully usable on mobile browser and installed PWA, and on desktop.
- **Performance:** Dashboard loads key data quickly (pagination for large lists).
- **Installability:** Meets PWA install criteria for iOS Safari ("Add to Home Screen").
- **Maintainability:** Feature-based folder structure, reusable components, TypeScript throughout.

---

## 2. Application Flow Diagram (Text-Based)

```
                         ┌────────────────────────┐
                         │   Your Existing Website │
                         │   (contact form)        │
                         └───────────┬─────────────┘
                                     │ sends data via secure API
                                     ▼
                         ┌────────────────────────┐
                         │   INQUIRIES             │
                         │  (raw incoming leads)   │
                         └───────────┬─────────────┘
                                     │ you review & qualify
                                     ▼
                         ┌────────────────────────┐
                         │   LEADS                 │
                         │  (being followed up)    │
                         └───────────┬─────────────┘
                                     │ you convert (won)
                                     ▼
                         ┌────────────────────────┐
                         │   CLIENTS               │
                         │  (converted, ongoing)   │
                         └───────────┬─────────────┘
                                     │ you create a project
                                     ▼
                         ┌────────────────────────┐
                         │   PROJECTS               │
                         └─────┬─────────┬─────────┘
                               │         │
                     ┌─────────▼──┐  ┌───▼─────────┐
                     │   TASKS     │  │  REVISIONS  │
                     └─────────────┘  └─────────────┘
                                     │
                                     │ project ready to bill
                                     ▼
                         ┌────────────────────────┐
                         │   INVOICES               │
                         └───────────┬─────────────┘
                                     │ client pays
                                     ▼
                         ┌────────────────────────┐
                         │   PAYMENTS               │
                         └───────────┬─────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │  PROJECT COMPLETED      │
                         └────────────────────────┘
```

Everything is visible from a central **Dashboard** which pulls summary data from every stage.

---

## 3. Database Schema (Plain Language First)

Before the technical table list, here's how the pieces relate, in plain English:

- An **Inquiry** is raw, unqualified interest from your website. It may or may not become a Lead.
- A **Lead** is an Inquiry you're actively pursuing. One Lead can turn into one Client.
- A **Client** can have **many Projects** (a client might hire you multiple times).
- A **Project** can have **many Tasks** and **many Revisions**.
- A **Project** can have **one or more Invoices** (e.g., 50% upfront, 50% on completion).
- An **Invoice** can have **many Payments** (partial payments allowed).

### 3.1 Tables

**`inquiries`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| full_name | text | |
| email | text | |
| phone | text | nullable |
| message | text | |
| source | text | e.g. "website_form", "manual" |
| status | text | `new`, `reviewed`, `converted_to_lead`, `discarded` |
| created_at | timestamptz | |

**`leads`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| inquiry_id | uuid (FK → inquiries.id) | nullable — leads can also be added manually |
| full_name | text | |
| email | text | |
| phone | text | nullable |
| notes | text | nullable |
| status | text | `contacted`, `negotiating`, `won`, `lost` |
| created_at | timestamptz | |

**`clients`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| lead_id | uuid (FK → leads.id) | nullable — clients can be added directly too |
| full_name | text | |
| company_name | text | nullable |
| email | text | |
| phone | text | nullable |
| notes | text | nullable |
| created_at | timestamptz | |

**`projects`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| client_id | uuid (FK → clients.id) | |
| title | text | |
| description | text | nullable |
| status | text | `planning`, `in_progress`, `in_revision`, `completed`, `on_hold` |
| start_date | date | nullable |
| due_date | date | nullable |
| created_at | timestamptz | |

**`tasks`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| project_id | uuid (FK → projects.id) | |
| title | text | |
| description | text | nullable |
| status | text | `todo`, `in_progress`, `done` |
| assigned_to | uuid (FK → auth.users.id) | nullable (future: team members) |
| due_date | date | nullable |
| created_at | timestamptz | |

**`revisions`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| project_id | uuid (FK → projects.id) | |
| round_number | integer | e.g. Revision 1, 2, 3 |
| feedback | text | |
| status | text | `requested`, `in_progress`, `resolved` |
| created_at | timestamptz | |

**`invoices`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| project_id | uuid (FK → projects.id) | |
| invoice_number | text | unique, auto-generated |
| amount | numeric | |
| status | text | `draft`, `sent`, `partially_paid`, `paid`, `overdue` |
| due_date | date | nullable |
| created_at | timestamptz | |

**`payments`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| invoice_id | uuid (FK → invoices.id) | |
| amount | numeric | |
| payment_method | text | e.g. `bank_transfer`, `cash`, `other` |
| paid_at | date | |
| notes | text | nullable |
| created_at | timestamptz | |

### 3.1.1 New Tables (Added in v2)

**`services`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| name | text | e.g. "Logo Design", "Game UI Kit" |
| description | text | nullable |
| default_price | numeric | nullable — starting point when creating a project/invoice, editable per project |
| is_active | boolean | so you can retire a service without deleting history |
| created_at | timestamptz | |

*Why:* A simple catalog so you're not retyping service names/prices every time you create a project or invoice. `projects` will get an optional `service_id` link (see note below) so you can report on "which services make the most revenue" later.

> **Note on existing tables:** to connect Services to Projects, we'll add one new optional column `service_id` (uuid, FK → services.id, nullable) to the existing `projects` table in Section 3.1. This is an *additive* change — it doesn't touch or break anything already defined there.

**`messages`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| client_id | uuid (FK → clients.id) | nullable |
| lead_id | uuid (FK → leads.id) | nullable — a message can belong to a lead (pre-conversion) or a client |
| direction | text | `incoming` or `outgoing` |
| subject | text | nullable |
| body | text | the message content |
| sent_by | uuid (FK → auth.users.id) | nullable — who sent it, if outgoing |
| status | text | `sent`, `failed`, `draft` |
| created_at | timestamptz | |

*Why:* Keeps a running email conversation history tied to a lead or client, so you never lose context on "what did we already tell them." Replies sent from inside the CRM get logged here too.

**`notifications`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → auth.users.id) | who the notification is for |
| type | text | e.g. `new_inquiry`, `invoice_overdue`, `revision_requested`, `task_due` |
| title | text | short headline |
| message | text | nullable, longer detail |
| link | text | nullable — where clicking the notification should take you |
| is_read | boolean | default false |
| created_at | timestamptz | |

*Why:* Powers the notification bell/center in the dashboard so you don't miss things like a new inquiry or an overdue invoice.

**`activity_logs`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| entity_type | text | e.g. `lead`, `client`, `project`, `invoice` — what kind of record this is about |
| entity_id | uuid | the id of that record |
| action | text | e.g. `created`, `status_changed`, `payment_recorded` |
| description | text | human-readable summary, e.g. "Status changed from Sent to Paid" |
| performed_by | uuid (FK → auth.users.id) | nullable |
| created_at | timestamptz | |

*Why:* This single table is the backbone for **both** the dashboard's "Recent Activity" feed **and** the new Client Activity Timeline (Section 7) — we just filter by `entity_type`/`entity_id`. One system, two views, no duplicate logic.

**`files`**
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| entity_type | text | e.g. `client`, `project`, `invoice` — what the file is attached to |
| entity_id | uuid | the id of that record |
| file_name | text | original file name |
| storage_path | text | path inside Supabase Storage bucket |
| file_type | text | e.g. `image/png`, `application/pdf` |
| file_size_kb | integer | nullable |
| uploaded_by | uuid (FK → auth.users.id) | nullable |
| created_at | timestamptz | |

*Why:* Lets you attach design files, contracts, or reference images directly to a project or client instead of emailing them back and forth.

**Storage Plan (File Management):**
- Files themselves live in **Supabase Storage** (not the database) — the `files` table above just keeps track of *where* each file is and what it's attached to.
- Planned buckets: `project-files` (private, only logged-in team can access) and `client-files` (private).
- Access controlled the same way as everything else — Row Level Security + signed URLs, so files are never publicly guessable.
- File size limits and allowed file types (e.g. images, PDFs, common design files) will be defined and shown to you before Phase build — flagged as an Open Question in Section 10.

### 3.2 Indexes (Planned)
- `leads.inquiry_id`, `clients.lead_id`, `projects.client_id`, `tasks.project_id`, `revisions.project_id`, `invoices.project_id`, `payments.invoice_id` — all foreign keys indexed automatically by Supabase, but we'll double check on setup.
- `inquiries.status`, `leads.status`, `projects.status`, `invoices.status` — indexed for fast dashboard filtering.
- **(New)** `messages.client_id`, `messages.lead_id`, `notifications.user_id`, `notifications.is_read`, `activity_logs.entity_type`+`entity_id` (combined index — this pairing gets queried constantly for the timeline), `files.entity_type`+`entity_id`.

---

## 4. ER Diagram (Text-Based)

```
inquiries (1) ────────< (0..1) leads (1) ────────< (0..1) clients
                                                        │
                                                        │ (1)
                                                        ▼
                                                     (many)
                                                    projects
                                                    │      │
                                        (1)─────────┘      └──────(1)
                                        ▼                          ▼
                                     (many)                     (many)
                                      tasks                    revisions

                                     projects (1) ──────< (many) invoices (1) ──────< (many) payments
```

Legend: `────<` means "one row relates to many rows" (one-to-many).

### 4.1 New Relationships (Added in v2)

```
leads (1) ──────< (many) messages >────── (1) clients
   (a message belongs to EITHER a lead OR a client, not both)

clients (1) ──< projects ──< invoices  ...(as above, unchanged)

services (1) ──────< (many) projects        (optional link — a project may use a service template)

auth.users (1) ──────< (many) notifications

[any entity: lead/client/project/invoice] ──────< (many) activity_logs
[any entity: client/project/invoice]      ──────< (many) files
```

*Note: `activity_logs` and `files` connect to multiple tables via a generic `entity_type` + `entity_id` pair rather than separate foreign keys — this keeps us from adding a new column to every table every time we add a new loggable/attachable feature. I'll explain this pattern simply when we build it.*

---

## 5. Folder Structure (Feature-Based)

```
agency-crm/
├── app/                          # Next.js App Router pages
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── inquiries/
│   │   ├── leads/
│   │   ├── clients/
│   │   ├── projects/
│   │   │   └── [projectId]/
│   │   │       ├── tasks/
│   │   │       └── revisions/
│   │   ├── invoices/
│   │   ├── payments/
│   │   ├── messages/              # (new) email conversation history
│   │   ├── files/                 # (new) file manager
│   │   ├── services/              # (new) services catalog
│   │   └── layout.tsx
│   ├── api/
│   │   ├── inquiries/            # public endpoint for website contact form
│   │   └── webhooks/
│   ├── manifest.ts               # PWA manifest
│   ├── layout.tsx
│   └── globals.css
│
├── features/                     # feature-based logic, separate from UI routes
│   ├── inquiries/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   └── api.ts
│   ├── leads/
│   ├── clients/
│   ├── projects/
│   ├── tasks/
│   ├── revisions/
│   ├── invoices/
│   ├── payments/
│   ├── messages/                 # (new)
│   ├── notifications/            # (new)
│   ├── activity-log/             # (new) — shared logic used by dashboard feed + client timeline
│   ├── services/                 # (new)
│   └── files/                    # (new)
│
├── components/                   # shared, reusable UI (buttons, inputs, tables, modals)
│   ├── ui/
│   ├── notifications/            # (new) — notification bell + dropdown, used in layout
│   └── layout/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
│
├── public/
│   ├── icons/                    # PWA icons (various sizes for iOS)
│   └── ...
│
├── types/
│   └── database.types.ts         # auto-generated from Supabase schema
│
├── .env.local                    # secrets (never committed to git)
├── next.config.js                # includes PWA config
└── tailwind.config.ts
```

**Why this structure:**
- `app/` handles routing only (what page shows at what URL).
- `features/` holds the actual logic per business feature — this is what makes it "feature-based" and easy to scale.
- `components/` is for things reused everywhere (a button, a table, a modal) — not tied to one feature.
- This keeps things modular: if we ever need to fix "invoices," everything related lives in one predictable place.

---

## 6. API Plan

### 6.1 Public Endpoint (for your existing website)
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/inquiries` | POST | Your website's contact form sends visitor data here. Creates a new row in `inquiries`. Protected by a secret API key (not a login) so only your website can submit. |

### 6.2 Internal Endpoints (used by the CRM itself, protected by login)
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/leads` | GET/POST | List/create leads |
| `/api/leads/:id` | PATCH | Update lead status |
| `/api/clients` | GET/POST | List/create clients |
| `/api/clients/:id` | PATCH | Update client |
| `/api/projects` | GET/POST | List/create projects |
| `/api/projects/:id` | PATCH | Update project |
| `/api/projects/:id/tasks` | GET/POST | Tasks for a project |
| `/api/projects/:id/revisions` | GET/POST | Revisions for a project |
| `/api/invoices` | GET/POST | List/create invoices |
| `/api/invoices/:id/payments` | GET/POST | Payments against an invoice |
| `/api/services` | GET/POST | List/create services in the catalog |
| `/api/messages` | GET/POST | List conversation history / send a reply (lead or client) |
| `/api/notifications` | GET | List notifications for the logged-in user |
| `/api/notifications/:id/read` | PATCH | Mark a notification as read |
| `/api/activity-logs` | GET | Fetch activity, filterable by `entity_type` + `entity_id` (powers both dashboard feed and client timeline) |
| `/api/files` | GET/POST | List/upload files for a client, project, or invoice |
| `/api/files/:id` | DELETE | Remove a file |
| `/api/analytics/summary` | GET | Returns dashboard analytics: monthly revenue, outstanding revenue, conversion rate |

> Note: With Supabase, most of this can actually go directly from the frontend to Supabase (with Row Level Security protecting it), so we may not need to hand-build every endpoint — I'll explain this trade-off simply when we reach that phase. The one endpoint we **definitely** need to hand-build is `/api/inquiries`, since that's the bridge from your outside website into the CRM.

> **New note on Messages:** to actually *send* outgoing emails (not just log them), we'll need an email-sending service connected in Phase build (e.g. Resend or a similar provider — free tier is fine to start). This is flagged as an Open Question in Section 10. Until that's set up, the Messages module can still log/read conversation history — sending is the one piece with an external dependency.

---

## 7. UI Wireframes (Text-Based)

### 7.1 Dashboard (Home) — Updated in v2
```
┌─────────────────────────────────────────────────────┐
│  [Logo]  Dashboard Inquiries Leads Clients ...  🔔(3) │  <- top nav + notification bell w/ unread count
├─────────────────────────────────────────────────────┤
│  Quick Actions                                          │
│  [+ New Lead] [+ New Client] [+ New Project] [+ Invoice] │  <- (NEW) one-tap shortcuts
├─────────────────────────────────────────────────────┤
│  New Inquiries: 4     Active Leads: 7                │
│  Active Projects: 5   Unpaid Invoices: 2              │
├─────────────────────────────────────────────────────┤
│  Analytics (NEW)                                         │
│  Monthly Revenue: $4,200     Outstanding: $1,100          │
│  Lead → Client Conversion Rate: 38%                        │
├─────────────────────────────────────────────────────┤
│  Recent Activity  (now powered by activity_logs)       │
│  • New inquiry from "John Doe" — 2 hrs ago            │
│  • Project "Brand Refresh" moved to In Revision        │
│  • Invoice #0012 marked Paid                           │
├─────────────────────────────────────────────────────┤
│  Upcoming Deadlines                                    │
│  • Project "Game UI Kit" — due in 3 days               │
└─────────────────────────────────────────────────────┘
```

**Quick Actions (new):** A row of one-tap shortcut buttons at the top of the dashboard for the 4 things you'll do most often — no need to navigate through menus first.

**Analytics (new):**
- *Monthly Revenue* = sum of `payments.amount` where `paid_at` falls in the current month.
- *Outstanding Revenue* = sum of `invoices.amount` where status is `sent`, `partially_paid`, or `overdue`, minus payments already received against them.
- *Conversion Rate* = (number of `leads` with status `won`) ÷ (total number of `leads`) over a selected time period.

### 7.2 Inquiries List
```
┌─────────────────────────────────────────────────────┐
│  Inquiries                              [+ Add Manual]│
├─────────────────────────────────────────────────────┤
│  Name        Email             Status      Date       │
│  John Doe     john@x.com        New         Aug 10     [Convert to Lead]
│  Jane Smith   jane@y.com        Reviewed     Aug 9      [Convert to Lead]
└─────────────────────────────────────────────────────┘
```

### 7.3 Project Detail Page
```
┌─────────────────────────────────────────────────────┐
│  ← Back    Project: Brand Refresh (Client: Acme Co.) │
│  Status: In Progress ▾                                │
├─────────────────────────┬─────────────────────────────┤
│ Tasks                    │ Revisions                    │
│ ☐ Logo concepts           │ Round 1 — Resolved             │
│ ☑ Mood board               │ Round 2 — In Progress           │
│ ☐ Final delivery            │ [+ New Revision Round]           │
│ [+ Add Task]               │                                  │
├─────────────────────────┴─────────────────────────────┤
│ Invoices                                                │
│ INV-0012  $500  Paid                                    │
│ INV-0013  $500  Sent   [Record Payment]                 │
└─────────────────────────────────────────────────────┘
```

### 7.4 Client Detail Page — Now with Activity Timeline (New)
```
┌─────────────────────────────────────────────────────┐
│  ← Back    Client: Acme Co.  (John Doe)               │
│  Projects: 2   Total Billed: $2,500                     │
├─────────────────────────┬─────────────────────────────┤
│ Activity Timeline (NEW)   │  Files (NEW)                   │
│ • Client created — Aug 1   │  📎 brief.pdf                   │
│ • Project started — Aug 3   │  📎 logo_v2.png                 │
│ • Message sent — Aug 5       │  [+ Upload File]                 │
│ • Invoice #0012 paid — Aug 9  │                                  │
├─────────────────────────┴─────────────────────────────┤
│ Messages (NEW)                                          │
│ [Incoming] "Can we push the deadline?" — Aug 5           │
│ [Outgoing] "Sure, moved to next Friday." — Aug 5          │
│ [+ Reply]                                                 │
└─────────────────────────────────────────────────────┘
```
*The Activity Timeline pulls from the `activity_logs` table filtered to this client — the exact same data source as the dashboard's "Recent Activity" feed, just filtered to one client instead of everything.*

### 7.5 Notification Center (New)
```
┌─────────────────────────────────────────────────────┐
│  Notifications                          [Mark all read]│
├─────────────────────────────────────────────────────┤
│  🔵 New inquiry received — "Jane Smith"    2 hrs ago    │
│  🔵 Invoice #0013 is now overdue            1 day ago    │
│  ⚪ Revision requested on "Brand Refresh"    2 days ago   │
└─────────────────────────────────────────────────────┘
```
🔵 = unread, ⚪ = read. Tapping a notification takes you straight to the related record (using the `link` field).

### 7.6 Mobile View (PWA installed) — Bottom Nav Style
```
┌───────────────────────┐
│  Dashboard              │
│  ...content...           │
│                            │
│                            │
├───────────────────────┤
│ [Home][Leads][Clients][+] │  <- bottom tab bar, thumb-friendly
└───────────────────────┘
```

---

## 8. PWA Requirements Checklist

- [ ] `manifest.json` with app name, icons (multiple sizes incl. 180x180 for iOS), theme color, display: `standalone`
- [ ] Apple-specific meta tags in `<head>` (`apple-mobile-web-app-capable`, `apple-touch-icon`, etc.) — required for proper iOS install behavior
- [ ] Service worker for offline caching of shell/static assets (not full offline data sync — that's a future TODO)
- [ ] HTTPS hosting (required for PWA — Vercel provides this by default)
- [ ] "Add to Home Screen" tested on actual iPhone Safari before we call this phase done

---

## 9. Development Checklist (Roadmap)

- [ ] **Phase 0 — Foundation:** Next.js + Supabase + Tailwind setup, environment variables, folder structure, PWA shell
- [ ] **Phase 1 — Authentication:** Login for you/your team, protected dashboard routes
- [ ] **Phase 2 — Inquiries:** Manual entry + public API endpoint for your website's contact form
- [ ] **Phase 3 — Leads:** Convert inquiry → lead, manage lead status
- [ ] **Phase 4 — Clients:** Convert lead → client
- [ ] **Phase 5 — Projects:** Create/manage projects under a client
- [ ] **Phase 6 — Tasks:** Task management inside a project
- [ ] **Phase 7 — Revisions:** Revision round tracking
- [ ] **Phase 8 — Invoices:** Generate invoices per project
- [ ] **Phase 9 — Payments:** Record payments against invoices
- [ ] **Phase 10 — Services Catalog:** *(New)* Create/manage the services your agency offers
- [ ] **Phase 11 — Activity Log:** *(New)* Core logging system — built early since Messages, Notifications, and the Timeline all depend on it
- [ ] **Phase 12 — Notifications:** *(New)* Notification center + bell icon, triggered by key events
- [ ] **Phase 13 — Messages:** *(New)* Conversation history + reply sending (requires email provider setup)
- [ ] **Phase 14 — File Management:** *(New)* Upload/attach/view files on clients, projects, invoices
- [ ] **Phase 15 — Dashboard Analytics & Quick Actions:** *(New)* Revenue/conversion widgets + one-tap shortcut buttons
- [ ] **Phase 16 — Client Activity Timeline:** *(New)* Timeline view on the client detail page (built after Activity Log exists)
- [ ] **Phase 17 — Dashboard polish:** Summary widgets, recent activity, deadlines
- [ ] **Phase 18 — Full PWA testing:** iPhone install test, responsive QA pass on all modules
- [ ] **Ongoing:** Each feature ships with its own "Future Improvements (Not Built Yet)" TODO list for your review

> **Why Activity Log moved earlier (Phase 11):** Notifications, Messages logging, and the Client Timeline all read from the same `activity_logs` table, so it makes sense to build that foundation once, early, rather than three separate times.

Each phase = one confirmation checkpoint from you before I move on, per your Development Process rule.

---

## 10. Open Questions Before We Begin

1. Confirm the stack assumptions in Section 0 (Next.js + Supabase + Tailwind + Vercel).
2. Team size — is it just you, or will other team members need their own logins in Phase 1?
3. What currency should invoices use by default?
4. Do you have an existing Supabase project already, or should I walk you through creating one from scratch?
5. For the website integration (Section 6.1) — do you know what platform your website is built on (WordPress, Webflow, custom HTML, etc.)? This affects how we wire up the contact form to send data to the CRM.
6. **(New) Messages/Email:** Do you want the CRM to send real emails to clients/leads (needs an email provider like Resend connected), or should Messages just be a manual log of conversations for now (no real sending, just record-keeping)?
7. **(New) Notifications:** In-app only (bell icon in the CRM) to start, or do you also want push notifications / email alerts? In-app is simpler for a first version — push notifications on iPhone PWA have some extra Apple-specific setup we can add later.
8. **(New) File uploads:** Any specific file types/sizes you expect to upload most (e.g. PSD/AI files can be large) — this affects storage limits we plan for.
9. **(New) Services catalog:** Do you already have a fixed list of services/prices, or should we start empty and you'll add them as you go?

---

**Once you approve this blueprint (or tell me what to change), we start Phase 0: Foundation Setup.**
