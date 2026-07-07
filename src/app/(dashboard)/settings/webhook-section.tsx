"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateTime } from "@/lib/settle/format";
import type { SettingsOverview } from "@/lib/settle/types";

export function WebhookSection({
  webhook,
}: {
  webhook: SettingsOverview["webhook"];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    delivered: boolean;
    status_code: number;
    signed: boolean;
  } | null>(null);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const data: Record<string, string> = {};

    form.forEach((value, key) => {
      if (typeof value === "string" && value.trim()) {
        data[key] = value.trim();
      }
    });

    const response = await fetch("/api/settle/auth/webhook", {
      body: JSON.stringify(data),
      headers: { "content-type": "application/json" },
      method: "PATCH",
    });

    if (response.ok) {
      setMessage("Webhook settings saved.");
      router.refresh();
    } else {
      const err = await response.json().catch(() => null);
      setMessage(err?.detail ?? "Could not save webhook settings.");
    }

    setSaving(false);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setMessage(null);

    const response = await fetch("/api/settle/settings/webhook/test", {
      method: "POST",
    });

    if (response.ok) {
      const data = await response.json();
      setTestResult({
        delivered: data.delivered,
        status_code: data.status_code,
        signed: data.signed,
      });
      router.refresh();
    } else {
      const err = await response.json().catch(() => null);
      setMessage(err?.detail ?? "Test webhook failed.");
    }

    setTesting(false);
  }

  return (
    <form className="mt-6 grid gap-5" onSubmit={handleSave}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          Webhook URL
        </span>
        <input
          className="input"
          name="webhook_url"
          type="url"
          placeholder="https://myapp.com/webhooks/settle"
          defaultValue={webhook.url ?? ""}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          Signing secret
        </span>
        <input
          className="input"
          name="webhook_secret"
          type="password"
          placeholder={webhook.has_secret ? "••••••••" : "Enter a secret to sign payloads"}
        />
        <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
          Used to generate the <code className="font-mono">X-Settle-Signature</code> header.
          Choose any strong random string.
        </p>
      </label>

      {testResult ? (
        <div className="rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                {testResult.delivered ? "Delivered" : "Delivery failed"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                HTTP {testResult.status_code} · signed{" "}
                {testResult.signed ? "yes" : "no"}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                testResult.delivered
                  ? "bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[var(--color-primary)]"
                  : "bg-[rgba(217,124,72,0.16)] text-[var(--color-accent)]"
              }`}
            >
              {testResult.delivered ? "Delivered" : "Failed"}
            </span>
          </div>
        </div>
      ) : webhook.last_test ? (
        <div className="rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                Last test delivered
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                HTTP {webhook.last_test.status_code} · signed{" "}
                {webhook.last_test.signed ? "yes" : "no"} ·{" "}
                {formatDateTime(webhook.last_test.tested_at)}
              </p>
            </div>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
              Delivered
            </span>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
          {message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={testing}
          className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleTest}
        >
          {testing ? "Testing..." : "Test webhook"}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save webhook"}
        </button>
      </div>
    </form>
  );
}
