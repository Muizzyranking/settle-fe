"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatNaira } from "@/lib/settle/format";
import type { RefundCandidate } from "@/lib/settle/types";
import { BankSelect } from "@/components/bank-select";

type BankInfo = {
  code: string;
  name: string;
};

export function RefundForm({
  candidates,
}: {
  candidates: RefundCandidate[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [destinationNumber, setDestinationNumber] = useState("");
  const [destinationBank, setDestinationBank] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = candidates.filter(
    (c) =>
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      c.bank_account_number.includes(search),
  );

  const selectedCandidate = candidates.find(
    (c) => c.account_id === selectedAccountId,
  );

  async function loadBanks() {
    if (banks.length > 0) return;

    const response = await fetch("/api/settle/settings/banks");

    if (response.ok) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.data ?? data.banks ?? [];
      setBanks(
        list.map((b: { code?: string; name?: string }) => ({
          code: b.code ?? "",
          name: b.name ?? "",
        })),
      );
    }
  }

  async function handleVerify() {
    if (!destinationNumber || destinationNumber.length < 10 || !destinationBank) {
      return;
    }

    setVerifying(true);
    setError(null);
    setResolvedName(null);

    const response = await fetch("/api/settle/settings/banks/lookup", {
      body: JSON.stringify({
        account_number: destinationNumber,
        bank_code: destinationBank,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (response.ok) {
      const data = await response.json();
      setResolvedName(data.account_name ?? "Verified");
    } else {
      const err = await response.json().catch(() => null);
      setError(err?.detail ?? "Could not verify account.");
    }

    setVerifying(false);
  }

  async function handleConfirmRefund() {
    if (!selectedAccountId || !resolvedName) return;

    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/settle/finance/refund", {
      body: JSON.stringify({
        virtual_account_id: selectedAccountId,
        amount: Number.parseFloat(refundAmount),
        destination_account_number: destinationNumber,
        destination_bank_code: destinationBank,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (response.ok) {
      const data = await response.json();
      setResult({
        ok: true,
        message: `Refund of ${formatNaira(Number.parseFloat(refundAmount))} processed. Reference: ${data.reference ?? data.id ?? ""}`,
      });
      setSelectedAccountId(null);
      setDestinationNumber("");
      setDestinationBank("");
      setRefundAmount("");
      setResolvedName(null);
      router.refresh();
    } else {
      const err = await response.json().catch(() => null);
      setResult({
        ok: false,
        message: err?.detail ?? "Refund failed.",
      });
    }

    setSubmitting(false);
    setShowConfirm(false);
  }

  if (!selectedCandidate) {
    return (
      <div className="grid gap-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
            Search overpaid accounts
          </span>
          <input
            className="input"
            placeholder="Customer name or account number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        {candidates.length === 0 && !search ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            No overpaid accounts found.
          </p>
        ) : null}

        <div className="grid gap-3">
          {filtered.map((candidate) => (
            <button
              key={candidate.account_id}
              type="button"
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4 text-left transition-colors hover:border-[var(--color-primary)]"
              onClick={() => {
                setSelectedAccountId(candidate.account_id);
                setRefundAmount(String(candidate.overpaid_amount));
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {candidate.customer_name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                    {candidate.collection_name} ·{" "}
                    {candidate.bank_account_number}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#25638A]">
                  {formatNaira(candidate.overpaid_amount)}
                </p>
              </div>
            </button>
          ))}
        </div>

        {search && filtered.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            No accounts match your search.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[var(--radius-sm)] border border-[rgba(61,130,180,0.18)] bg-[rgba(61,130,180,0.08)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              {selectedCandidate.customer_name}
            </p>
            <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
              {selectedCandidate.collection_name} ·{" "}
              {selectedCandidate.bank_account_number}
            </p>
          </div>
          <p className="text-sm font-semibold text-[#25638A]">
            {formatNaira(selectedCandidate.overpaid_amount)}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="btn-ghost min-h-0 justify-start text-sm"
        onClick={() => {
          setSelectedAccountId(null);
          setDestinationNumber("");
          setDestinationBank("");
          setResolvedName(null);
          setError(null);
        }}
      >
        &larr; Back to search
      </button>

      <BankSelect
        banks={banks}
        value={destinationBank}
        onChange={(code) => {
          setDestinationBank(code);
          setResolvedName(null);
        }}
        label="Destination bank"
        loading={banks.length === 0}
      />

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          Destination account number
        </span>
        <div className="flex gap-3">
          <input
            className="input"
            inputMode="numeric"
            maxLength={10}
            placeholder="0123456789"
            value={destinationNumber}
            onChange={(e) => {
              setDestinationNumber(e.target.value.replace(/\D/g, ""));
              setResolvedName(null);
            }}
          />
          <button
            type="button"
            disabled={
              !destinationBank ||
              destinationNumber.length < 10 ||
              verifying
            }
            className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleVerify}
          >
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-[var(--color-ink)]">
          Refund amount
        </span>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-ink-faint)]">
            ₦
          </span>
          <input
            className="input pl-8"
            inputMode="decimal"
            value={refundAmount}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.]/g, "");
              if (
                Number.parseFloat(val) <= selectedCandidate.overpaid_amount
              ) {
                setRefundAmount(val);
              }
            }}
          />
        </div>
        <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
          Max: {formatNaira(selectedCandidate.overpaid_amount)}
        </p>
      </label>

      {resolvedName ? (
        <div className="rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-3">
          <p className="text-sm text-[var(--color-ink)]">
            Sending to{" "}
            <span className="font-semibold">{resolvedName}</span>
          </p>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-[var(--color-error)]">{error}</p>
      ) : null}

      <button
        type="button"
        disabled={!resolvedName || !refundAmount}
        className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => setShowConfirm(true)}
      >
        Review refund
      </button>

      {result ? (
        <div
          className={`rounded-[var(--radius-sm)] border p-4 ${
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
            {result.ok ? "Refund submitted" : "Failed"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {result.message}
          </p>
        </div>
      ) : null}

      {showConfirm && resolvedName ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 shadow-[var(--shadow-float)]">
            <h3 className="text-lg font-semibold text-[var(--color-heading)]">
              Confirm refund
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Send {formatNaira(Number.parseFloat(refundAmount))} to{" "}
              <span className="font-semibold text-[var(--color-ink)]">
                {resolvedName}
              </span>
              ?
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
                onClick={handleConfirmRefund}
              >
                {submitting ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
