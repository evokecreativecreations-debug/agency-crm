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

## Phase 3 — Inquiries ⬜
- ⬜ Manual inquiry entry (internal)
- ⬜ Public API endpoint for website contact form
- ⬜ Inquiries list + status management

## Phase 4 — Leads ⬜
- ⬜ Convert inquiry → lead
- ⬜ Lead status management

## Phase 5 — Clients ⬜
- ⬜ Convert lead → client
- ⬜ Client list + detail page

## Phase 6 — Projects ⬜
- ⬜ Create/manage projects under a client

## Phase 7 — Tasks ⬜
- ⬜ Task management inside a project

## Phase 8 — Revisions ⬜
- ⬜ Revision round tracking

## Phase 9 — Invoices ⬜
- ⬜ Generate invoices per project

## Phase 10 — Payments ⬜
- ⬜ Record payments against invoices

## Phase 11 — Services Catalog ⬜
- ⬜ Create/manage services

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
