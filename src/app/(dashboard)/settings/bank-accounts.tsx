"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SavedBankAccount } from "@/lib/settle/types";
import { BankSelect } from "@/components/bank-select";

type BankInfo = {
  code: string;
  name: string;
};

export function BankAccountsSection({
  accounts,
}: {
  accounts: SavedBankAccount[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function setDefault(id: string) {
    setMessage(null);

    const response = await fetch(
      `/api/settle/settings/bank-accounts/${id}/set-default`,
      { method: "PATCH" },
    );

    if (response.ok) {
      router.refresh();
    } else {
      const err = await response.json().catch(() => null);
      setMessage(err?.detail ?? "Could not set default bank.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this bank account?")) return;

    setMessage(null);

    const response = await fetch(`/api/settle/settings/bank-accounts/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.refresh();
    } else {
      const err = await response.json().catch(() => null);
      setMessage(err?.detail ?? "Could not remove bank account.");
    }
  }

  return (
    <>
      <div className="mt-5 grid gap-3">
        {accounts.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            No bank accounts saved yet.
          </p>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {account.bank_name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                    {account.account_number}
                  </p>
                </div>
                {account.is_default ? (
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--color-primary)]">
                    Default
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
                {account.account_name}
              </p>
              <div className="mt-3 flex gap-3">
                {!account.is_default ? (
                  <button
                    type="button"
                    className="btn-ghost min-h-0 text-xs"
                    onClick={() => setDefault(account.id)}
                  >
                    Set as default
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn-ghost min-h-0 text-xs text-[var(--color-error)]"
                  onClick={() => remove(account.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {message ? (
        <p className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
          {message}
        </p>
      ) : null}

      <AddBankAccountButton
        onAdded={() => {
          router.refresh();
        }}
      />
    </>
  );
}

function AddBankAccountButton({
  onAdded,
}: {
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openForm() {
    setOpen(true);
    setLoadingBanks(true);
    setError(null);

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
    } else {
      setError("Could not load banks.");
    }

    setLoadingBanks(false);
  }

  async function verify() {
    if (!selectedBank || accountNumber.length < 10) return;

    setVerifying(true);
    setError(null);
    setResolvedName(null);

    const response = await fetch("/api/settle/settings/banks/lookup", {
      body: JSON.stringify({
        account_number: accountNumber,
        bank_code: selectedBank,
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

  async function save() {
    if (!selectedBank || !accountNumber || !resolvedName) return;

    setSaving(true);
    setError(null);

    const response = await fetch("/api/settle/settings/bank-accounts", {
      body: JSON.stringify({
        account_number: accountNumber,
        bank_code: selectedBank,
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    if (response.ok) {
      setOpen(false);
      setSelectedBank("");
      setAccountNumber("");
      setResolvedName(null);
      onAdded();
    } else {
      const err = await response.json().catch(() => null);
      setError(err?.detail ?? "Could not save bank account.");
    }

    setSaving(false);
  }

  function cancel() {
    setOpen(false);
    setSelectedBank("");
    setAccountNumber("");
    setResolvedName(null);
    setError(null);
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-ink)]"
          onClick={openForm}
        >
          Add bank account
        </button>
      ) : null}

      {open ? (
        <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-4">
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            Add bank account
          </p>

          <div className="mt-4 grid gap-4">
            <BankSelect
              banks={banks}
              value={selectedBank}
              onChange={(code) => {
                setSelectedBank(code);
                setResolvedName(null);
              }}
              loading={loadingBanks}
              label="Bank"
            />

            <label className="block">
              <span className="mb-2 block text-xs font-medium text-[var(--color-ink-faint)]">
                Account number
              </span>
              <div className="flex gap-3">
                <input
                  className="input"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="0123456789"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value.replace(/\D/g, ""));
                    setResolvedName(null);
                  }}
                />
                <button
                  type="button"
                  disabled={
                    !selectedBank ||
                    accountNumber.length < 10 ||
                    verifying
                  }
                  className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={verify}
                >
                  {verifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </label>

            {resolvedName ? (
              <div className="rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-3">
                <p className="text-sm text-[var(--color-ink)]">
                  Transfer will go to{" "}
                  <span className="font-semibold">{resolvedName}</span> —
                  confirm?
                </p>
              </div>
            ) : null}

            {error ? (
              <p className="text-sm text-[var(--color-error)]">{error}</p>
            ) : null}

            <div className="flex gap-3">
              <button
                type="button"
                disabled={!resolvedName || saving}
                className="btn-primary justify-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
                onClick={save}
              >
                {saving ? "Saving..." : "Save account"}
              </button>
              <button
                type="button"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-ink)]"
                onClick={cancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
