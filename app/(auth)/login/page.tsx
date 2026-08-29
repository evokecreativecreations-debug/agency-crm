"use client";

import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    window.location.href = redirectTo;
  }

  async function handleForgotPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setMessage(
      "If an account exists for this email, a password reset link has been sent."
    );

    setLoading(false);
  }

  function switchToForgotPassword() {
    setForgotMode(true);
    setError(null);
    setMessage(null);
  }

  function switchToLogin() {
    setForgotMode(false);
    setError(null);
    setMessage(null);
  }

  return (
    <main className="min-h-dvh bg-paper">
      <div className="grid min-h-dvh lg:grid-cols-2">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-ink lg:flex">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-signal blur-3xl" />
            <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-signal blur-3xl" />
          </div>

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-signal text-sm font-bold text-white">
                  A
                </div>

                <span className="text-lg font-semibold tracking-tight text-white">
                  Agency CRM
                </span>
              </div>
            </div>

            <div className="max-w-lg">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-signal">
                Agency management
              </p>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white xl:text-5xl">
                Everything your agency needs, in one place.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-white/60">
                Manage inquiries, leads, clients, projects and invoices
                from one simple workspace.
              </p>
            </div>

            <p className="text-xs text-white/40">
              Internal CRM · Secure workspace
            </p>
          </div>
        </section>

        {/* Form panel */}
        <section className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-ink text-sm font-bold text-white">
                A
              </div>

              <span className="text-lg font-semibold tracking-tight text-ink">
                Agency CRM
              </span>
            </div>

            {!forgotMode ? (
              <>
                <div>
                  <p className="text-sm font-medium text-signal">
                    Welcome back
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    Sign in to your workspace
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate">
                    Enter your credentials to continue to Agency CRM.
                  </p>
                </div>

                <form
                  onSubmit={handleLogin}
                  className="mt-8 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-sm font-medium text-ink"
                    >
                      Email
                    </label>

                    <div className="relative mt-1.5">
                      <Mail
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />

                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="block w-full rounded-[var(--radius-md)] border border-line bg-surface py-3 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-signal"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="login-password"
                        className="block text-sm font-medium text-ink"
                      >
                        Password
                      </label>

                      <button
                        type="button"
                        onClick={switchToForgotPassword}
                        className="text-xs font-medium text-signal transition hover:text-signal-hover hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative mt-1.5">
                      <LockKeyhole
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />

                      <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        className="block w-full rounded-[var(--radius-md)] border border-line bg-surface py-3 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-signal"
                      />
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-[var(--radius-sm)] border border-danger/20 bg-danger-soft px-3 py-2.5 text-sm leading-5 text-danger"
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-[var(--radius-md)] bg-signal px-4 py-3 text-sm font-medium text-white transition hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                </form>

                <p className="mt-8 text-center text-xs leading-5 text-slate">
                  Your account is protected by secure authentication.
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate transition hover:text-ink"
                >
                  <ArrowLeft
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Back to login
                </button>

                <div>
                  <p className="text-sm font-medium text-signal">
                    Account recovery
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                    Reset your password
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate">
                    Enter your email address and we&apos;ll send you a
                    secure password reset link.
                  </p>
                </div>

                <form
                  onSubmit={handleForgotPassword}
                  className="mt-8 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-medium text-ink"
                    >
                      Email
                    </label>

                    <div className="relative mt-1.5">
                      <Mail
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />

                      <input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        autoFocus
                        className="block w-full rounded-[var(--radius-md)] border border-line bg-surface py-3 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-signal"
                      />
                    </div>
                  </div>

                  {error && (
                    <div
                      role="alert"
                      className="rounded-[var(--radius-sm)] border border-danger/20 bg-danger-soft px-3 py-2.5 text-sm leading-5 text-danger"
                    >
                      {error}
                    </div>
                  )}

                  {message && (
                    <div
                      role="status"
                      className="rounded-[var(--radius-sm)] border border-success/20 bg-success-soft px-3 py-2.5 text-sm leading-5 text-success"
                    >
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-[var(--radius-md)] bg-signal px-4 py-3 text-sm font-medium text-white transition hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending…" : "Send reset link"}
                  </button>
                </form>

                <p className="mt-8 text-xs leading-5 text-slate">
                  For security, we&apos;ll only confirm that a reset
                  request was processed if the email can be used for an
                  account.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}