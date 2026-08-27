# Agency CRM — PROJECT.md

**Status:** 🔒 Architecture Frozen (as of Blueprint v2 approval)
**Owner:** Rameez
**Type:** Internal agency CRM — Progressive Web App (PWA)

---

## 1. What This Project Is

A private, internal CRM for a creative/design agency that manages the full client lifecycle:

```
Website Inquiry → Lead → Client → Project → Tasks → Revisions → Invoice → Payment → Completed Project
```

Installable on iPhone/Android/Desktop as a PWA. The agency's existing marketing website is **never modified** — it only sends inquiry data to this CRM via a secure API endpoint.

Full details, database schema, ER diagram, wireframes, and API plan live in **`CRM_Blueprint_v2.md`** — that document is the approved, frozen source of truth for *what* we're building.

---

## 2. 🔒 Architecture Freeze Rule

**As of Blueprint v2 approval, the following are FROZEN and require Rameez's explicit approval before any change:**
- Database schema (tables, columns, relationships)
- Folder structure
- Tech stack (Next.js + Supabase + Tailwind + PWA)
- Core module list (see Blueprint v2, Section 1.5)

Any new feature must be built **within** this approved structure. If a feature genuinely cannot fit the frozen architecture, that gets raised as a question — never changed silently.

---

## 3. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database + Auth | Supabase (Postgres + Auth + Row Level Security) |
| File Storage | Supabase Storage |
| Hosting | Vercel (planned) |
| PWA | Native Next.js manifest + service worker, iOS-specific meta tags |

---

## 4. Folder Structure (Frozen — see Blueprint v2, Section 5)

```
agency-crm/
├── app/ # Routing only (App Router pages)
├── features/ # Business logic per module (leads, clients, projects, auth, etc.)
├── components/ # Shared, reusable UI (buttons, tables, modals, layout)
├── lib/ # Supabase clients, utility functions
├── public/ # Static assets, PWA icons
├── types/ # Shared/generated TypeScript types
├── supabase/migrations/ # SQL migration files (standard Supabase CLI convention — added Phase 3)
├── proxy.ts # Route protection (Next.js 16's renamed middleware.ts)
```

---

## 5. Core Modules (Frozen — see Blueprint v2, Section 1.5)

1. Authentication
2. Inquiries
3. Leads
4. Clients
5. Projects
6. Tasks
7. Revisions
8. Invoices
9. Payments
10. Dashboard
11. Messages
12. Notifications
13. Activity Log
14. Services
15. File Management
16. Dashboard Analytics
17. Client Activity Timeline

---

## 6. Development Process (Every Feature Follows This)

1. Explain what we're building
2. Explain why
3. List files created/modified
4. Generate complete code
5. Explain exactly where to paste it
6. Explain how to run the project
7. Explain how to test the feature
8. **Wait for Rameez's confirmation before moving on**

Every feature ships with a "Future Improvements (Not Built Yet)" TODO list — nothing on it gets built until approved.

---

## 7. Key Reference Documents

| File | Purpose |
|---|---|
| `CRM_Blueprint_v2.md` | Full SRS, DB schema, ER diagram, API plan, wireframes (the approved plan) |
| `PROJECT.md` | This file — quick architecture reference, freeze rules |
| `CHANGELOG.md` | History of every completed feature/phase |
| `TASKS.md` | Live task list / roadmap tracker |
| `DESIGN_SYSTEM.md` | Every design token and reusable UI component, with usage guidance |

---

---
8. Current Phase

Phase 14 — Messages (complete, approved)

Gmail message synchronization and conversation history are now implemented. The CRM can fetch Gmail messages, group them into conversations using Gmail thread IDs, prevent duplicate message imports, and display inbound/outbound message history in the /messages interface. Message body extraction supports both plain-text and HTML MIME content, including nested MIME parts, with graceful handling for messages without usable text content.

Reply sending is also implemented through Resend. Users can compose and send replies from an existing conversation, with sent messages saved into the CRM's messages table and linked to the corresponding Gmail conversation/thread. Conversation search, conversation selection, message loading, responsive layout, and the Messages sidebar active-state behavior have all been implemented and manually verified.

Phase 14 status: ✅ Complete and verified by Rameez.