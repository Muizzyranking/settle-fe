"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApiKeySection({
  apiKeyPrefix,
}: {
  apiKeyPrefix: string | null;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [fullKey, setFullKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setMessage(null);

    const method = apiKeyPrefix ? "regenerate" : "generate";
    const response = await fetch(`/api/settle/auth/api-key/${method}`, {
      method: "POST",
    });

    if (response.ok) {
      const data = await response.json();
      setFullKey(data.api_key);
      setMessage(null);
      router.refresh();
    } else {
      const err = await response.json().catch(() => null);
      setMessage(err?.detail ?? "Could not generate API key.");
    }

    setGenerating(false);
  }

  return (
    <>
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-4">
          <p className="text-xs font-medium text-[var(--color-ink-faint)]">
            Key prefix
          </p>
          <p className="mt-2 font-mono text-lg font-semibold text-[var(--color-ink)]">
            {apiKeyPrefix ?? "No key yet"}
            {apiKeyPrefix ? "****" : ""}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Full keys are not retrievable after the one-time generation modal closes.
          </p>
        </div>
        <div className="grid content-start gap-3">
          <button
            type="button"
            disabled={generating}
            className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
            onClick={generate}
          >
            {generating
              ? "Generating..."
              : apiKeyPrefix
                ? "Regenerate key"
                : "Generate key"}
          </button>
        </div>
      </div>

      {fullKey ? (
        <div className="mt-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
          <p className="text-sm font-semibold text-[var(--color-heading)]">
            Your new API key
          </p>
          <p className="mt-1 text-sm text-[var(--color-accent)]">
            Copy this now. You won't be able to see it again.
          </p>
          <div className="mt-4 flex gap-3">
            <code className="flex-1 overflow-x-auto rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] px-4 py-3 font-mono text-sm text-[var(--color-ink)]">
              {fullKey}
            </code>
            <button
              type="button"
              className="btn-primary justify-center text-sm"
              onClick={() => {
                navigator.clipboard.writeText(fullKey);
                setMessage("Copied!");
                setTimeout(() => {
                  setMessage(null);
                  setFullKey(null);
                }, 3000);
              }}
            >
              Copy
            </button>
          </div>
          {message ? (
            <p className="mt-3 text-sm text-[var(--color-primary)]">{message}</p>
          ) : null}
        </div>
      ) : null}

      <pre className="mt-5 overflow-x-auto rounded-[var(--radius-sm)] bg-[var(--color-emerald-950)] p-4 text-xs leading-relaxed text-[var(--color-sand-100)]">
        <code>{`curl https://api.settle.ng/v1/collections \\
  -H "Authorization: Bearer ${apiKeyPrefix ?? "sk_live"}_..."`}</code>
      </pre>
    </>
  );
}
