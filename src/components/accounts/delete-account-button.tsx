"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteAccountButtonProps = {
  accountId: string;
  customerName: string;
};

export function DeleteAccountButton({
  accountId,
  customerName,
}: DeleteAccountButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async () => {
    setError(null);
    setIsDeleting(true);

    const response = await fetch(`/api/settle/accounts/${accountId}`, {
      method: "DELETE",
    });

    setIsDeleting(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      const detail = data?.detail ?? data?.error;

      setError(
        typeof detail === "string" ? detail : "Could not delete this account.",
      );
      return;
    }

    setDeleted(true);
    router.refresh();
  };

  if (deleted) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[rgba(185,28,28,0.22)] bg-[rgba(185,28,28,0.08)] p-5">
        <p className="text-sm font-semibold text-[var(--color-ink)]">
          Account deleted
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          This virtual account has been expired and marked inactive.
        </p>
        <Link href="/accounts" className="btn-ghost mt-3 min-h-0 text-sm">
          Back to accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[rgba(185,28,28,0.22)] bg-[rgba(185,28,28,0.08)] p-5">
      <p className="text-mono text-[#B91C1C]">Danger zone</p>
      <h2 className="mt-3 text-base font-semibold text-[var(--color-ink)]">
        Delete account
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        This expires the Nomba virtual account for {customerName} and marks it
        inactive.
      </p>

      {confirming ? (
        <div className="mt-4 grid gap-3">
          <p className="text-sm font-medium text-[var(--color-ink)]">
            Confirm account deletion?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={deleteAccount}
              disabled={isDeleting}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-btn)] bg-[#B91C1C] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 text-sm font-medium text-[var(--color-ink)]"
            >
              Cancel
            </button>
          </div>
          {error ? (
            <p className="text-sm font-medium text-[#B91C1C]">{error}</p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-btn)] border border-[rgba(185,28,28,0.36)] px-4 text-sm font-medium text-[#B91C1C]"
        >
          Delete account
        </button>
      )}
    </div>
  );
}
