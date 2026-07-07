"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatNaira } from "@/lib/settle/format";
import type { SavedBankAccount } from "@/lib/settle/types";

export function WithdrawForm({
  availableBalance,
  savedBanks,
}: {
  availableBalance: number;
  savedBanks: SavedBankAccount[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(
    savedBanks.find((b) => b.is_default)?.id ?? savedBanks[0]?.id ?? "",
  );
  const [amount, setAmount] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const selectedBank = savedBanks.find((b) => b.id === selectedId);
  const numericAmount = Number.parseFloat(amount);
  const isValid = selectedId && numericAmount > 0 && numericAmount <= availableBalance;

  function handleReview() {
    if (!isValid) return;
    setShowConfirm(true);
    setResult(null);
  }

  async function handleConfirm() {
    if (!selectedBank || !isValid) return;

    setSubmitting(true);
    setResult(null);

    const response = await fetch("/api/settle/finance/withdraw", {
      body: JSON.stringify({
        amount: numericAmount,
        bank_account_id: selectedId,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (response.ok) {
      const data = await response.json();
      setResult({
        ok: true,
        message: `Withdrawal of ${formatNaira(numericAmount)} to ${selectedBank.account_name} is being processed.`,
      });
      setAmount("");
      router.refresh();
    } else {
      const err = await response.json().catch(() => null);
      setResult({
        ok: false,
        message: err?.detail ?? "Withdrawal failed. Try again.",
      });
    }

    setSubmitting(false);
    setShowConfirm(false);
  }

  return (
    <>
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
            Destination bank
          </span>
          <select
            className="input"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {savedBanks.length === 0 ? (
              <option value="">No saved banks</option>
            ) : (
              savedBanks.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bank_name} · {account.account_number} ·{" "}
                  {account.account_name}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
            Amount
          </span>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-ink-faint)]">
              ₦
            </span>
            <input
              className="input pl-8"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setAmount(val);
              }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
            Available: {formatNaira(availableBalance)}
          </p>
        </label>

        {amount && numericAmount > availableBalance ? (
          <p className="text-sm text-[var(--color-error)]">
            Amount exceeds available balance.
          </p>
        ) : null}

        <div className="rounded-[var(--radius-sm)] border border-[rgba(190,160,106,0.34)] bg-[rgba(190,160,106,0.12)] p-4">
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            Review before sending
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            A final confirmation is required before this moves business funds.
          </p>
        </div>

        <button
          type="button"
          disabled={!isValid}
          className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleReview}
        >
          Review withdrawal
        </button>
      </div>

      {result ? (
        <div
          className={`mt-5 rounded-[var(--radius-sm)] border p-4 ${
            result.ok
              ? "border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
              : "border-[rgba(217,124,72,0.34)] bg-[rgba(217,124,72,0.12)]"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              result.ok ? "text-[var(--color-primary)]" : "text-[var(--color-accent)]"
            }`}
          >
            {result.ok ? "Submitted" : "Failed"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {result.message}
          </p>
        </div>
      ) : null}

      {showConfirm && selectedBank ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-float)]">
            <h3 className="text-lg font-semibold text-[var(--color-heading)]">
              Confirm withdrawal
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Transfer {formatNaira(numericAmount)} to{" "}
              <span className="font-semibold text-[var(--color-ink)]">
                {selectedBank.account_name}
              </span>{" "}
              — {selectedBank.bank_name} {selectedBank.account_number}?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-ink)]"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleConfirm}
              >
                {submitting ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
