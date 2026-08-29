"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, type FormEvent } from "react";

interface ProfileFormProps {
  email: string;
  fullName: string;
}

export function ProfileForm({
  email,
  fullName: initialFullName,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: fullName.trim(),
      },
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setMessage("Profile updated successfully.");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-ink"
        >
          Full name
        </label>

        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Your full name"
          autoComplete="name"
          className="mt-1.5 block w-full rounded-[var(--radius-sm)] border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition focus:border-ink"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-ink"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          disabled
          className="mt-1.5 block w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 text-sm text-slate"
        />

        <p className="mt-1 text-xs text-slate">
          Your login email is managed by your authentication account.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-[var(--radius-sm)] border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 text-sm text-ink"
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-[var(--radius-sm)] bg-ink px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
