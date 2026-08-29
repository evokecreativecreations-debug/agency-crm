"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    /*
     * In case the recovery session has already been established
     * before this component mounted.
     */
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <h1 className="text-2xl font-semibold text-ink">
              Password updated
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate">
              Your password has been updated successfully. You can
              now sign in with your new password.
            </p>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-6 w-full rounded-[var(--radius-md)] bg-signal px-4 py-2.5 text-sm font-medium text-white transition hover:bg-signal-hover"
            >
              Back to login
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 text-center shadow-[var(--shadow-soft)] sm:p-8">
            <h1 className="text-xl font-semibold text-ink">
              Checking reset link…
            </h1>

            <p className="mt-2 text-sm text-slate">
              Please wait while we verify your password reset
              session.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <h1 className="text-2xl font-semibold text-ink">
            Set a new password
          </h1>

          <p className="mt-2 text-sm text-slate">
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="reset-password"
                className="block text-sm font-medium text-ink"
              >
                New password
              </label>

              <input
                id="reset-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                minLength={6}
                required
                className="mt-1.5 block w-full rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-signal"
              />
            </div>

            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-sm font-medium text-ink"
              >
                Confirm password
              </label>

              <input
                id="reset-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                minLength={6}
                required
                className="mt-1.5 block w-full rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-signal"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-[var(--radius-sm)] border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[var(--radius-md)] bg-signal px-4 py-2.5 text-sm font-medium text-white transition hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}