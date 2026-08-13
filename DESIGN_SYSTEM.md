# DESIGN_SYSTEM.md — Agency CRM Design System

**Status:** Phase 0.5 — Complete, pending your review
**Live reference:** run the app and visit `/style-guide` and `/style-guide/layout-preview`
**Rule:** No feature component should hardcode a color, spacing, radius, or font size. Always use a token or a component from this system. If something you need doesn't exist yet, ask before inventing a one-off style.

---

## 1. Design Principles

- **Premium, minimal, modern** — a professional creative-agency dashboard, not a generic admin template.
- **Warm-neutral, not stark.** Backgrounds are off-white (`--color-paper`), not pure white or pure black — easier on the eyes for a tool used all day.
- **One confident accent, used with intention.** `--color-signal` (deep emerald) marks the single primary action or active state per screen — not applied everywhere just because it's the brand color.
- **Status is always color + label, never color alone** (accessibility — colorblind-safe).
- **Consistent focus rings** on every interactive element (visible keyboard navigation).

### Signature element: Pipeline-stage dots
Every stage of your business pipeline (Inquiry → Lead → Client → Project → Invoice → Paid) has one fixed color, always shown as a small dot next to its label in badges, tables, and later the sidebar. Once you learn "blue dot = Lead, green dot = Client," you can scan a busy dashboard and read status without reading every word. This is the one deliberately distinctive, recognizable pattern tying the whole app together — see `Badge.tsx`.

---

## 2. Color Tokens

| Token | Hex | Use |
|---|---|---|
| `--color-paper` | `#FAFAF8` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, panels, inputs |
| `--color-line` | `#E6E4E0` | Default borders/dividers |
| `--color-line-strong` | `#D4D1CB` | Input borders, stronger dividers |
| `--color-ink` | `#17171A` | Primary text |
| `--color-slate` | `#6B6B72` | Secondary text |
| `--color-muted` | `#A3A2A8` | Placeholder/disabled text |
| `--color-signal` | `#0E6B5C` | Primary actions, active nav, focus ring |
| `--color-amber` | `#C2760C` | Secondary accent — used sparingly |
| `--color-success` | `#1C8A5E` | Positive status (Paid, Active) |
| `--color-warning` | `#C2760C` | Caution status (Due Soon) |
| `--color-danger` | `#D1373F` | Negative status (Overdue, delete) |
| `--color-info` | `#2A63C4` | Neutral-informative status |

**Pipeline stage colors** (see signature element above):
`--color-stage-inquiry` (slate) · `--color-stage-lead` (blue) · `--color-stage-client` (signal green) · `--color-stage-project` (violet) · `--color-stage-invoice` (amber) · `--color-stage-paid` (success green)

All tokens live in `app/globals.css` and are exposed as Tailwind utilities automatically (e.g. `bg-signal`, `text-slate`, `border-line`) via Tailwind v4's `@theme inline`.

---

## 3. Typography Scale

Component: `components/ui/Typography.tsx` → `Display, H1, H2, H3, BodyLg, Body, BodySm, Eyebrow, Caption, Mono`

| Component | Size / Line-height | Weight | Use |
|---|---|---|---|
| `<Display>` | 2.25rem / 1.15 | 600 | Rare page hero titles |
| `<H1>` | 1.875rem / 1.2 | 600 | Top-level page title |
| `<H2>` | 1.5rem / 1.3 | 600 | Section titles (PageHeader default) |
| `<H3>` | 1.125rem / 1.4 | 600 | Card titles, subsections |
| `<BodyLg>` | 1rem / 1.5 | 400 | Intro paragraphs, empty states |
| `<Body>` | 0.875rem / 1.5 | 400 | Default UI text, table cells |
| `<BodySm>` | 0.8125rem / 1.5 | 400 | Secondary/supporting text |
| `<Eyebrow>` | 0.75rem, uppercase, tracked | 500 | Small label above a heading |
| `<Caption>` | 0.75rem | 400 | Timestamps, table meta |
| `<Mono>` | 0.875rem, monospace | 400 | Money amounts, invoice numbers, IDs — keeps digits aligned |

**Font:** system font stack (`-apple-system, "Segoe UI", Roboto...`) — deliberately not a Google Font, so the app never depends on an external service just to render text. Easy to swap for a custom brand typeface later by changing one variable in `globals.css`.

---

## 4. Spacing System

Uses Tailwind's default 4px-based scale. Don't invent custom pixel values — pick the closest step:

| Step | Value | Use |
|---|---|---|
| 1–2 | 4–8px | Icon gaps, tight inline spacing |
| 3–4 | 12–16px | Component internal padding (buttons, inputs, badges) |
| 5–6 | 20–24px | Spacing between related elements in a card |
| 8 | 32px | Spacing between distinct sections on a page |
| 12–16 | 48–64px | Page-level top/bottom padding, major section breaks |

---

## 5. Radius & Shadow Scale

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Badges, small buttons |
| `--radius-md` | 10px | Buttons, inputs (default) |
| `--radius-lg` | 14px | Cards, panels |
| `--radius-xl` | 20px | Dialogs |
| `--shadow-soft` | subtle 2-layer shadow | Cards |
| `--shadow-dialog` | stronger shadow | Dialogs, drawers |

---

## 6. Components

All in `components/ui/` (generic) or `components/layout/` (page structure).

### Button — `Button.tsx`
Props: `variant` (`primary` \| `secondary` \| `outline` \| `ghost` \| `destructive`), `size` (`sm` \| `md` \| `lg`), `loading` (boolean).
- `primary` = the one main action per screen. `outline`/`ghost` for secondary actions. `destructive` only for delete/remove.
- `loading` shows a spinner and auto-disables the button — use during any async save/submit.

### Input / Textarea — `Input.tsx`, `Textarea.tsx`
Props: `label` (always required — no placeholder-only fields), `helperText`, `error`.
- Setting `error` turns the border red and replaces the helper text with the error message.
- Every field is linked to its label via `htmlFor`/`id` for screen readers.

### Card — `Card.tsx`
`Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`. Use these instead of ad-hoc `<div>` + padding so every card in the app has identical spacing.

### Badge — `Badge.tsx`
Props: `variant`. Semantic: `neutral, success, warning, danger, info`. Pipeline stage: `inquiry, lead, client, project, invoice, paid`. Always renders a colored dot + label together.

### Table — `Table.tsx`
`Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell`. Wrap in `Table` for automatic horizontal scroll on small screens and a consistent border/radius. Pair with `TableRowSkeleton` while loading, and `EmptyState` (not an empty table) when there's no data.

### Skeleton / Spinner — `Skeleton.tsx`, `Spinner.tsx`
- Use **Skeleton** when you already know the shape of the incoming content (a table row, a card) — feels faster, no layout jump.
- Use **Spinner** for short indeterminate waits with no known shape (e.g. "Signing in…").

### EmptyState — `EmptyState.tsx`
Props: `icon` (a `lucide-react` icon), `title`, `description`, `action` (optional `{label, onClick}`). Always shown instead of an empty table/list — treats emptiness as an invitation to act, not a dead end.

### Dialog — `Dialog.tsx`
Props: `open`, `onClose`, `title`, `description`, `children`, `footer`. Built without an external UI library — handles Escape-to-close, backdrop click, and returns focus to the triggering element. Use for focused tasks (confirmations, quick "New Lead" forms). Don't use for anything that needs its own URL/back button — use a real route instead.

### PageHeader — `PageHeader.tsx`
Props: `eyebrow`, `title`, `description`, `actions`. The title block at the top of every page — this is also the exact pattern the real Dashboard's **Quick Actions** row will use (see `/style-guide` → "Page Header + Quick Actions Pattern" section, and the live example in `/style-guide/layout-preview`).

### Sidebar — `layout/Sidebar.tsx`
Fixed on desktop (≥768px), becomes a slide-in drawer on mobile. Nav items mirror the frozen module list in `PROJECT.md`. Active item gets a tinted background + signal-colored dot.

### TopNav — `layout/TopNav.tsx`
Header bar: hamburger menu (mobile only), page title, notification bell (UI only — the real Notifications feature is Phase 12), account avatar placeholder.

### DashboardShell — `layout/DashboardShell.tsx`
Combines Sidebar + TopNav into the responsive page wrapper every dashboard page will use once routing exists:
```tsx
<DashboardShell activeHref="/leads" pageTitle="Leads">
  {/* page content */}
</DashboardShell>
```

---

## 7. Responsive Behavior

- Breakpoint used throughout: Tailwind's `md` (768px).
- **Below 768px:** Sidebar hides, becomes a full-height drawer opened via the TopNav hamburger. Cards/grids stack to a single column.
- **768px and up:** Sidebar is permanently visible; grids expand to 2–4 columns depending on content.
- Verified by resizing `/style-guide/layout-preview` in the browser.

---

## 8. Icons

Library: [`lucide-react`](https://lucide.dev) — lightweight, consistent stroke-based icon set, tree-shakeable (only icons you actually import are bundled). Default size in this system is `h-4 w-4` (16px) inline with text, `h-5 w-5` (20px) for standalone/empty-state icons. Always pass `aria-hidden="true"` on decorative icons (already done inside every component above).

---

## 9. Accessibility Notes

- Every interactive element has a visible focus ring (`:focus-visible` in `globals.css`).
- All form fields have real `<label>` elements, not placeholder-only.
- Dialog traps Escape/backdrop-close and restores focus on close.
- Color is never the only status signal — always paired with text.
- Respects `prefers-reduced-motion`.

---

## 10. Future Improvements (Not Built Yet)

- Dark mode (token structure supports it later, not implemented now)
- Toast/notification popups (separate from the Notification Center — Phase 12)
- Select/Dropdown, Checkbox, Radio, DatePicker components (will be added when the first feature that needs them is built, e.g. Leads status dropdown in Phase 3)
- Real avatar images (currently initials placeholder)
- Command palette / global search
- Custom brand typeface (currently system font stack)

Nothing above will be built until you approve it.

---

## 11. How to Review

1. Run the project (`npm install`, then `npm run dev`).
2. Visit `http://localhost:3000/style-guide` — every token and component in one place.
3. Visit `http://localhost:3000/style-guide/layout-preview` — Sidebar + TopNav + PageHeader working together. Resize your browser or open on your phone to see the responsive drawer behavior.
4. Neither page is a real feature — both are safe to keep as permanent internal documentation, or removed later.
