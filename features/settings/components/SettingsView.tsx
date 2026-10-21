"use client";

import { Body, H2 } from "@/components/ui/Typography";
import { useTheme } from "@/components/layout/ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useState, type FormEvent } from "react";

type Theme = "light" | "dark" | "system";

export function SettingsView() {
  const { theme, setTheme } = useTheme();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(
    null
  );

  async function handlePasswordChange(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordError(null);
    setPasswordSuccess(null);

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setPasswordError(error.message);
      setLoading(false);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setPasswordSuccess("Password updated successfully.");
    setLoading(false);
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Appearance */}
      <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6">
        <H2>Appearance</H2>

        <Body className="mt-2 text-slate">
          Choose how Agency CRM looks on your device.
        </Body>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ThemeOption
            value="light"
            current={theme}
            label="Light"
            description="Always use light mode"
            icon={<Sun className="h-5 w-5" />}
            onSelect={setTheme}
          />

          <ThemeOption
            value="dark"
            current={theme}
            label="Dark"
            description="Always use dark mode"
            icon={<Moon className="h-5 w-5" />}
            onSelect={setTheme}
          />

          <ThemeOption
            value="system"
            current={theme}
            label="System"
            description="Follow device settings"
            icon={<Monitor className="h-5 w-5" />}
            onSelect={setTheme}
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6">
        <H2>Follow-up reminders</H2>
        <Body className="mt-2 text-slate">Schedule your next action from Leads. Due reminders appear in Today and the notification bell while CRM is open.</Body>
        <p className="mt-3 text-sm leading-6 text-slate">On iPhone, add CRM to your Home Screen for quick access. Closed-app push and automatic email reminders are not enabled in this version.</p>
        <a href="/today" className="mt-4 inline-block text-sm font-medium text-signal">Open Today →</a>
      </section>

      {/* Security */}
      <section className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6">
        <H2>Security</H2>

        <Body className="mt-2 text-slate">
          Change your account password.
        </Body>

        <form
          onSubmit={handlePasswordChange}
          className="mt-5 max-w-xl space-y-4"
        >
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-ink"
            >
              New password
            </label>

            <input
              id="new-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              autoComplete="new-password"
              minLength={6}
              required
              className="mt-1.5 block w-full rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-signal"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-ink"
            >
              Confirm new password
            </label>

            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              minLength={6}
              required
              className="mt-1.5 block w-full rounded-[var(--radius-md)] border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition focus:border-signal"
            />
          </div>

          {passwordError && (
            <div
              role="alert"
              className="rounded-[var(--radius-sm)] border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger"
            >
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div
              role="status"
              className="rounded-[var(--radius-sm)] border border-success/20 bg-success-soft px-3 py-2 text-sm text-success"
            >
              {passwordSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-[var(--radius-md)] bg-signal px-4 py-2.5 text-sm font-medium text-on-signal transition hover:bg-signal-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}

function ThemeOption({
  value,
  current,
  label,
  description,
  icon,
  onSelect,
}: {
  value: Theme;
  current: Theme;
  label: string;
  description: string;
  icon: React.ReactNode;
  onSelect: (theme: Theme) => void;
}) {
  const selected = current === value;

  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={selected}
      className={[
        "flex min-h-28 flex-col items-start rounded-[var(--radius-md)] border p-4 text-left transition",
        selected
          ? "border-signal bg-signal-soft"
          : "border-line bg-surface hover:border-line-strong hover:bg-paper",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-9 w-9 items-center justify-center rounded-full",
          selected
            ? "bg-signal text-on-signal"
            : "bg-paper text-slate",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="mt-3 flex w-full items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink">{label}</span>

        {selected && (
          <Check
            className="h-4 w-4 text-signal"
            aria-hidden="true"
          />
        )}
      </div>

      <span className="mt-1 text-xs text-slate">
        {description}
      </span>
    </button>
  );
}
