# Changelog

All notable changes to this project are recorded here, one entry per completed step. Newest entries at the top.

---

## [Unreleased] — Phase 2: Authentication
**Status:** Complete, pending Rameez's review
**Date:** 2026-08-12

### Added
- `features/auth/AuthContext.tsx` — `AuthProvider`, syncs with Supabase auth state (initial session + `onAuthStateChange`)
- `features/auth/useAuth.ts` — `useAuth()` hook, exposes `user`, `session`, `isLoading`, `signOut`
- `lib/supabase/middleware.ts` — session refresh helper used by route protection
- `proxy.ts` (project root) — route protection; redirects unauthenticated visitors away from protected dashboard paths to `/login`, and signed-in users away from `/login` to `/dashboard`. Named `proxy.ts` per Next.js 16's renamed `middleware.ts` convention.
- `app/(auth)/layout.tsx` — centered, sidebar-free layout for auth pages
- `app/(auth)/login/page.tsx` — email/password login form using existing Input/Button design-system components
- `app/(dashboard)/dashboard/page.tsx` — minimal protected page confirming the auth flow end-to-end (shows the signed-in user's email)
- `components/layout/UserMenu.tsx` — now shows the real logged-in user and performs a real sign-out (was placeholder UI in Phase 1)
- `app/layout.tsx` — wrapped children with `<AuthProvider>` (minimal necessary change, nothing else touched)

### Notes
- No architecture, schema, or folder-structure changes — `features/auth/` follows the exact same feature-based pattern already used by every other module.
- Session persistence handled by Supabase's cookie-based SSR auth (`@supabase/ssr`), refreshed on every request via `proxy.ts`.
- Loading state: `AuthProvider` exposes `isLoading` for the initial session check; used by consuming components as needed.
- Verified with a clean production build (zero errors, zero warnings) — routes `/login` and `/dashboard` both build successfully.
- Requires a real Supabase project connected via `.env.local` to actually sign in (see Phase 0 setup) — not yet confirmed live by Rameez.

---

## [Unreleased] — Phase 0.5: Design System Foundation
**Status:** Complete, pending Rameez's review
**Date:** 2026-08-12

### Added
- Design tokens in `app/globals.css`: color palette, pipeline-stage colors, type scale variables, radius scale, shadow tokens, focus-ring style, reduced-motion support
- `components/ui/`: Typography, Button, Input, Textarea, Card, Badge, Table, Skeleton, Spinner, EmptyState, Dialog, PageHeader
- `components/layout/`: Sidebar (responsive, drawer on mobile), TopNav (hamburger + notification bell UI + account avatar), DashboardShell (combines both)
- `lib/utils.ts`: `cn()` helper for safe Tailwind class merging
- `/style-guide` and `/style-guide/layout-preview` — internal-only showcase pages, not business features
- `DESIGN_SYSTEM.md` — full documentation of every token and component
- Dependencies added: `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`

### Notes
- No business features implemented — every component here is generic/reusable.
- Verified with a clean production build (`next build`, zero errors) and manual page-load checks (all routes return HTTP 200).
- Architecture, schema, and folder structure remain exactly as frozen in Blueprint v2 — all additions live inside already-approved folders (`components/ui`, `components/layout`, `app/`).

---

## [Unreleased] — Phase 0: Foundation Setup
**Status:** Complete
**Date:** 2026-08-12

### Added
- Project scaffolding (Next.js + TypeScript + Tailwind CSS)
- Approved folder structure (`app/`, `features/`, `components/`, `lib/`, `types/`)
- Supabase client setup (browser + server) — connection placeholders, not yet linked to a live project
- PWA foundation: manifest, iOS meta tags, service worker registration
- Environment variable template (`.env.local.example`)
- `PROJECT.md`, `CHANGELOG.md`, `TASKS.md` governance files

### Notes
- No business features (Inquiries, Leads, Clients, etc.) are implemented yet.
- Foundation must be verified working before Phase 1 (Authentication) begins.

---

## [Blueprint v2] — Architecture Approved & Frozen
**Date:** 2026-08-12

### Added to Blueprint
- Messages module (email conversation history + replies)
- Notifications table + notification center
- Activity Log system (shared by dashboard feed + client timeline)
- Services catalog table
- File Management module + Supabase Storage plan
- Dashboard Analytics (monthly revenue, outstanding revenue, conversion rate)
- Client Activity Timeline
- Quick Actions section on dashboard

### Decision
- Architecture, database schema, and folder structure are now **frozen**. Future changes require explicit approval.

---

## [Blueprint v1] — Initial Blueprint Created
**Date:** 2026-08-12

### Added
- Software Requirements Specification (SRS)
- Initial database schema: inquiries, leads, clients, projects, tasks, revisions, invoices, payments
- ER diagram, application flow diagram
- Folder structure, API plan, text-based UI wireframes
- PWA requirements checklist
- Development checklist / phase roadmap
