"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { formatNaira } from "@/lib/settle/format";
import { friendlyError } from "@/lib/settle/errors";

type RecurrenceOption = "none" | "weekly" | "monthly" | "custom";

const recurrenceOptions: Array<{
  value: RecurrenceOption;
  label: string;
  detail: string;
}> = [
  { value: "none", label: "One-time", detail: "No due cycle" },
  { value: "weekly", label: "Weekly", detail: "Every week" },
  { value: "monthly", label: "Monthly", detail: "Every month" },
  { value: "custom", label: "Custom", detail: "Set days" },
];

function parseCurrency(value: string) {
  const normalized = Number(value.replace(/[^\d.]/g, ""));

  if (Number.isNaN(normalized)) {
    return 0;
  }

  return normalized;
}

function FieldHint({ required = false }: { required?: boolean }) {
  return (
    <span className="ml-2 text-xs font-medium text-[var(--color-ink-faint)]">
      {required ? "Required" : "Optional"}
    </span>
  );
}

export function NewCollectionForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [expectedAmount, setExpectedAmount] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceOption>("none");
  const [intervalDays, setIntervalDays] = useState("14");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = useMemo(() => parseCurrency(expectedAmount), [expectedAmount]);
  const recurrenceLabel =
    recurrence === "none"
      ? "One-time collection"
      : recurrence === "custom"
        ? `Every ${intervalDays || "0"} days`
        : `${recurrence[0].toUpperCase()}${recurrence.slice(1)} collection`;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const payload = {
      description: description.trim() || undefined,
      expected_amount: amount > 0 ? amount : undefined,
      name: name.trim(),
      recurrence:
        recurrence === "none"
          ? undefined
          : {
              frequency: recurrence,
              interval_days:
                recurrence === "custom" ? Number(intervalDays) : null,
            },
    };
    const response = await fetch("/api/settle/collections", {
      body: JSON.stringify(payload),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const data = await response.json().catch(() => null);

    setIsSaving(false);

    if (!response.ok) {
      const detail = data?.detail ?? data?.error;

      if (response.status === 401 || detail === "session_expired") {
        router.push("/auth/login?error=session_expired");
        router.refresh();
        return;
      }

      setError(friendlyError(detail));
      return;
    }

    const collectionId = data?.id ?? data?.collection?.id;

    router.push(collectionId ? `/collections/${collectionId}` : "/collections");
    router.refresh();
  };

  return (
    <form
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]"
      onSubmit={onSubmit}
    >
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
        <div className="grid gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Collection name
              <FieldHint required />
            </span>
            <input
              className="input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="August Rent 2026"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Description
              <FieldHint />
            </span>
            <textarea
              className="input min-h-28 resize-y py-3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this payment is for"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
              Expected amount
              <FieldHint />
            </span>
            <input
              className="input"
              inputMode="decimal"
              value={expectedAmount}
              onChange={(event) => setExpectedAmount(event.target.value)}
              placeholder="45000"
            />
          </label>

          <fieldset>
            <legend className="mb-3 text-sm font-medium text-[var(--color-ink)]">
              Recurrence
              <FieldHint />
            </legend>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {recurrenceOptions.map((option) => {
                const selected = option.value === recurrence;

                return (
                  <label
                    key={option.value}
                    className={`
                      cursor-pointer rounded-[var(--radius-sm)] border px-4 py-3 transition-colors
                      ${
                        selected
                          ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg-subtle)] hover:border-[var(--color-border-strong)]"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="recurrence"
                      value={option.value}
                      checked={selected}
                      onChange={() => setRecurrence(option.value)}
                      className="sr-only"
                    />
                    <span className="block text-sm font-semibold text-[var(--color-ink)]">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--color-ink-muted)]">
                      {option.detail}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {recurrence === "custom" ? (
            <label className="block max-w-xs">
              <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
                Interval days
                <FieldHint required />
              </span>
              <input
                className="input"
                type="number"
                min="1"
                value={intervalDays}
                onChange={(event) => setIntervalDays(event.target.value)}
                required
              />
            </label>
          ) : null}
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--color-ink-muted)]">
              You can add customer accounts after creating the collection.
            </p>
            {error ? (
              <p className="mt-2 text-sm font-medium text-[var(--color-error)]">
                {error}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Creating..." : "Create collection"}
          </button>
        </div>
      </div>

      <aside className="grid content-start gap-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-mono text-[var(--color-ink-faint)]">Preview</p>
          <h2 className="mt-4 text-display-md text-[var(--color-heading)]">
            {name || "Untitled collection"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {description || "No description yet."}
          </p>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-4">
              <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                Expected per account
              </p>
              <p className="mt-2 text-xl font-semibold text-[var(--color-heading)]">
                {formatNaira(amount)}
              </p>
            </div>
            <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-4">
              <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                Schedule
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-ink)]">
                {recurrenceLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[rgba(190,160,106,0.34)] bg-[rgba(190,160,106,0.12)] p-5">
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            Account provisioning comes next
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            After a collection exists, create customer accounts under it for
            payment tracking.
          </p>
        </div>
      </aside>
    </form>
  );
}
