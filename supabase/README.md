# Database migrations

For a new database, run the SQL migrations in filename order. The new
20260814090000 prerequisite creates leads before clients/projects; the original
20260818120000 leads migration is retained to preserve existing migration history.
The clients migration is now in migrations/, and safely tolerates policies from
an earlier manual setup.

## Existing CRM database

Before using the updated inquiry-to-lead conversion, apply
`migrations/20261019090000_atomic_inquiry_conversion.sql` to the existing Supabase
project, after confirming the existing inquiries/leads tables are present.
This adds a security-invoker function and grants execution only to authenticated
users. It does not add/remove table columns, delete records or merge historical
duplicates. Existing RLS remains in force.

Do not reset the live database or rerun historical non-idempotent migrations.
If using the Supabase CLI, reconcile its remote migration history before pushing
new prerequisite migrations with older timestamps. For an existing manually
configured database, the new conversion function can be applied on its own in
the Supabase SQL Editor.

The conversion deliberately has no fallback to separate browser writes. A missing
function produces a clear update-required error instead of risking duplicates.
Apply the database function before releasing the updated client.

## Verification

`npm test` runs migrations and conversion/rollback/RLS tests in a temporary,
in-memory PostgreSQL database using PGlite. It never uses .env.local credentials
or modifies the live Supabase project. PGlite is a single-connection test engine;
true multi-session concurrency still needs verification against a staging server.

## October 21 feature batch — apply once, after review

`migrations/20261021090000_followups_and_billing.sql` is a separate, transactional
update for personal lead follow-ups, quotation drafts and itemised invoices.
It adds tables/columns/functions; it does not delete or rewrite existing business
records. Old invoices retain their existing amount and an empty item list until
edited. Existing notifications remain shared legacy notices; new follow-up
notifications are scoped to their owner with RLS.

Apply this file on its own to the existing CRM database before releasing this
feature batch. Do not rerun it: the new tables/triggers intentionally fail if the
batch is already installed. A failure rolls back the entire transaction.

The invoice and quotation triggers calculate totals in PostgreSQL and allocate
numbers under transaction locks. Quotation conversion locks the quotation and
links the resulting draft invoice atomically; retries return the same invoice.
The tests cover retry and rollback behavior. Multi-session race tests require a
separate staging Postgres connection; PGlite cannot simulate parallel sessions.

### Reminders and Today

- Reminders are personal. Team leads/projects and issued invoice balances retain
  the existing shared agency model.
- While CRM is open and visible, a signed-in user collects due notifications on
  startup and each minute. Rescheduling/completing/cancelling reads the previous
  alert. A unique follow-up/due-time key prevents duplicate alerts on repeated
  visits. Opening Today refreshes its data each minute while visible.
- Today includes overdue/today tasks assigned to the user or still unassigned,
  active project deadlines, and all issued unpaid invoices. Paid balances are
  calculated from payment records; draft invoices are excluded.
- `CRM_TIME_ZONE` defaults to `Asia/Karachi` for Today. Reminder entry uses the
  device time zone and stores a UTC instant. Dates are formatted explicitly in
  the agency time zone on Today.
- No background scheduler, closed-app Web Push or automatic email delivery is
  installed. This is stated in the UI. iPhone installation/deployment remains a
  separate step; no marketing website change is involved.

### Documents

Quotations support a lead or client, active service-catalog prices, multiple
items, two-decimal quantities/prices, discount before tax, a requested advance,
notes, validity and payment terms. Save drafts and download the PDF to share;
mark Sent/Accepted after actual sharing/client approval. This does not send mail
or create client-facing approval links. Accepted quotes convert only to projects
owned by the quoted client (or the client converted from that lead).

New invoices use the same editor. Requested advances do not create payments.
PDF routes require a session, use normal RLS and return private/no-store downloads.
The renderer embeds bundled OFL-licensed Noto Sans, with Vercel tracing configured
for those files. Unsupported glyphs render as `?`; additional script fonts and
RTL document layout are not implemented. PDF output and existing totals are USD.
No bank or tax registration details have been invented.

### Future improvements — not built in this batch

- Closed-app iPhone push with explicit opt-in, HTTPS and scheduled dispatch.
- Reusable proposal templates, PDF email delivery and client approval links.
- Multi-currency accounting and additional language/RTL PDF layouts.
- Task ownership controls, task/project reminder scheduling and calendar sync.
