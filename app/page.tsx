/**
 * Phase 0 placeholder homepage.
 *
 * This is NOT a business feature — it's a simple status page so we can
 * confirm the foundation (Next.js + Tailwind + Supabase client + PWA) is
 * working before Phase 1 (Authentication) begins.
 *
 * This file will be replaced once Phase 1 adds real login/dashboard routing.
 */
export default function Home() {
  const checks = [
    { label: "Next.js + TypeScript", done: true },
    { label: "Tailwind CSS", done: true },
    { label: "Approved folder structure", done: true },
    { label: "Supabase client configured", done: true },
    { label: "PWA manifest + service worker", done: true },
    { label: "Supabase project connected (your keys)", done: false },
  ];

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6">
      <main className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Phase 0
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900">
          Foundation Setup
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          No business features yet — this page just confirms the project
          foundation is working.
        </p>

        <ul className="mt-6 space-y-3">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center gap-3 text-sm">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  check.done
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-300 text-zinc-400"
                }`}
              >
                {check.done ? "✓" : ""}
              </span>
              <span className={check.done ? "text-zinc-700" : "text-zinc-400"}>
                {check.label}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-zinc-400">
          See <code className="font-mono">TASKS.md</code> for the full
          roadmap.
        </p>
      </main>
    </div>
  );
}
