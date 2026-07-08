"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDateTime, formatNaira, formatNumber } from "@/lib/settle/format";
import type { FinanceOverview, FinancePayout } from "@/lib/settle/types";
import { RefundForm } from "./refund-form";
import { WithdrawForm } from "./withdraw-form";

function SummaryCard({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "green" | "amber" | "blue";
}) {
  const toneClass = {
    default: "text-[var(--color-heading)]",
    green: "text-[var(--color-primary)]",
    amber: "text-[#8A5D14]",
    blue: "text-[#25638A]",
  }[tone];

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
      <p className="text-mono text-[var(--color-ink-faint)]">{label}</p>
      <p className={`mt-4 text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        {detail}
      </p>
    </div>
  );
}

function PayoutStatus({ payout }: { payout: FinancePayout }) {
  const className = {
    paid: "border-[color-mix(in_srgb,var(--color-primary)_32%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]",
    processing:
      "border-[rgba(61,130,180,0.28)] bg-[rgba(61,130,180,0.12)] text-[#25638A]",
    pending:
      "border-[rgba(190,160,106,0.36)] bg-[rgba(190,160,106,0.14)] text-[#8A5D14]",
  }[payout.status];

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {payout.status[0].toUpperCase()}
      {payout.status.slice(1)}
    </span>
  );
}

function Tabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-1">
      {["withdraw", "refund"].map((tab) => (
        <button
          key={tab}
          type="button"
          className={`flex-1 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors ${
            active === tab
              ? "bg-[var(--color-surface-raised)] text-[var(--color-ink)] shadow-[var(--shadow-card)]"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
          onClick={() => onChange(tab)}
        >
          {tab === "withdraw" ? "Withdraw" : "Refund"}
        </button>
      ))}
    </div>
  );
}

export function FinanceClient({
  finance,
}: {
  finance: FinanceOverview;
}) {
  const [activeTab, setActiveTab] = useState("withdraw");
  const defaultBank = finance.saved_bank_accounts.find(
    (account) => account.is_default,
  );

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-mono text-[var(--color-ink-faint)]">Finance</p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
            Move settled money with control.
          </h1>
          <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Review available balances, saved bank accounts, withdrawals, and
            overpayment refunds before wiring real money movement.
          </p>
        </div>
        <Link href="/settings" className="btn-primary justify-center text-sm">
          Manage bank accounts
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Available balance"
          value={formatNaira(finance.available_balance)}
          detail={
            defaultBank
              ? `Default: ${defaultBank.bank_name}`
              : "No default bank selected"
          }
          tone="green"
        />
        <SummaryCard
          label="Pending settlement"
          value={formatNaira(finance.pending_settlement)}
          detail="Transfers still clearing"
          tone="blue"
        />
        <SummaryCard
          label="Withdrawn"
          value={formatNaira(finance.total_withdrawn)}
          detail="Total paid out to saved banks"
        />
        <SummaryCard
          label="Refundable"
          value={formatNaira(finance.refundable_overpayments)}
          detail="Overpaid balances eligible for refund"
          tone="amber"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-heading)]">
                {activeTab === "withdraw" ? "Withdrawal" : "Refund"}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {activeTab === "withdraw"
                  ? "Transfer settled funds to your saved bank account."
                  : "Return overpaid amounts to a customer."}
              </p>
            </div>
            <Tabs active={activeTab} onChange={setActiveTab} />
          </div>

          <div className="mt-6">
            {activeTab === "withdraw" ? (
              <WithdrawForm
                availableBalance={finance.available_balance}
                savedBanks={finance.saved_bank_accounts}
              />
            ) : (
              <RefundForm candidates={finance.refund_candidates} />
            )}
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-mono text-[var(--color-ink-faint)]">
              Saved banks
            </p>
            <div className="mt-5 grid gap-3">
              {finance.saved_bank_accounts.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-muted)]">
                  No bank accounts saved yet.
                </p>
              ) : (
                finance.saved_bank_accounts.map((account) => (
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
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">
              Recent withdrawals
            </h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Settlement history for saved bank accounts.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">Destination</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Fee</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Requested</th>
              </tr>
            </thead>
            <tbody>
              {finance.recent_payouts.map((payout) => (
                <tr
                  key={payout.id}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <td className="px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">
                    {payout.destination}
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--color-ink)]">
                    {formatNaira(payout.amount)}
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                    {formatNaira(payout.fee)}
                  </td>
                  <td className="px-5 py-4">
                    <PayoutStatus payout={payout} />
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                    {formatDateTime(payout.requested_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-[var(--radius-card)] border border-[rgba(61,130,180,0.24)] bg-[rgba(61,130,180,0.08)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">
              Refund queue
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Refunds should only be enabled for accounts with confirmed
              overpayment and the amount capped at the overpaid difference.
            </p>
          </div>
          <span className="rounded-full border border-[rgba(61,130,180,0.24)] bg-[var(--color-surface-raised)] px-3 py-1 text-xs font-medium text-[#25638A]">
            {formatNumber(finance.refund_candidates.length)} candidate
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {finance.refund_candidates.map((candidate) => (
            <div
              key={candidate.account_id}
              className="rounded-[var(--radius-sm)] border border-[rgba(61,130,180,0.18)] bg-[var(--color-surface-raised)] p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
              <button
                type="button"
                className="btn-ghost mt-3 min-h-0 text-sm"
                onClick={() => setActiveTab("refund")}
              >
                Refund
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
