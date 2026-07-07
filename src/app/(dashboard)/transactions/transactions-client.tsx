"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDateTime, formatNaira, formatNumber } from "@/lib/settle/format";
import { getPaymentStatusMeta } from "@/lib/settle/status";
import type { PaymentStatus, TransactionRecord } from "@/lib/settle/types";

const statusOptions: Array<{ value: PaymentStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "exact", label: "Paid" },
  { value: "underpaid", label: "Underpaid" },
  { value: "overpaid", label: "Overpaid" },
  { value: "misdirected", label: "Misdirected" },
];

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

function StatusBadge({ status }: { status: PaymentStatus }) {
  const meta = getPaymentStatusMeta(status);

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function TransactionCard({
  transaction,
}: {
  transaction: TransactionRecord;
}) {
  const hasAccount = transaction.account_id.startsWith("acct_");

  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
            {transaction.customer_name}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--color-ink-faint)]">
            {transaction.collection_name}
          </p>
        </div>
        <StatusBadge status={transaction.status} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
          <p className="text-[11px] text-[var(--color-ink-faint)]">Gross</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
            {formatNaira(transaction.amount)}
          </p>
        </div>
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
          <p className="text-[11px] text-[var(--color-ink-faint)]">Fee</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
            {formatNaira(transaction.platform_fee)}
          </p>
        </div>
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
          <p className="text-[11px] text-[var(--color-ink-faint)]">Net</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
            {formatNaira(transaction.net_amount)}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-[var(--color-ink-muted)]">
          {formatDateTime(transaction.paid_at)}
        </p>
        {hasAccount ? (
          <Link
            href={`/accounts/${transaction.account_id}`}
            className="btn-ghost min-h-0 text-sm"
          >
            Account
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function TransactionsTable({
  transactions,
}: {
  transactions: TransactionRecord[];
}) {
  return (
    <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] lg:block">
      <table className="w-full min-w-[1080px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-ink-faint)]">
            <th className="px-5 py-3 font-medium">Customer</th>
            <th className="px-5 py-3 font-medium">Reference</th>
            <th className="px-5 py-3 font-medium">Gross</th>
            <th className="px-5 py-3 font-medium">Fee</th>
            <th className="px-5 py-3 font-medium">Net credited</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Paid at</th>
            <th className="px-5 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const hasAccount = transaction.account_id.startsWith("acct_");

            return (
              <tr
                key={transaction.id}
                className="border-b border-[var(--color-border)] last:border-b-0"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {transaction.customer_name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                    {transaction.collection_name}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {transaction.reference}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                    {transaction.sender_bank_name}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-[var(--color-ink)]">
                  {formatNaira(transaction.amount)}
                </td>
                <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                  {formatNaira(transaction.platform_fee)}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">
                  {formatNaira(transaction.net_amount)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                  {formatDateTime(transaction.paid_at)}
                </td>
                <td className="px-5 py-4">
                  {transaction.account_id.startsWith("acct_") ? (
                    <Link
                      href={`/accounts/${transaction.account_id}`}
                      className="btn-ghost min-h-0 text-sm"
                    >
                      Account
                    </Link>
                  ) : (
                    <span className="text-sm text-[var(--color-ink-faint)]">
                      Review
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function TransactionsClient({
  transactions: allTransactions,
  misdirected,
}: {
  transactions: TransactionRecord[];
  misdirected: TransactionRecord[];
}) {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const filtered = useMemo(() => {
    let result = allTransactions;

    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.customer_name.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.sender_bank_name.toLowerCase().includes(q),
      );
    }

    return result;
  }, [allTransactions, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const gross = allTransactions.reduce(
    (sum, t) => sum + t.amount,
    0,
  );
  const fees = allTransactions.reduce(
    (sum, t) => sum + t.platform_fee,
    0,
  );
  const net = allTransactions.reduce(
    (sum, t) => sum + t.net_amount,
    0,
  );
  const reviewCount = allTransactions.filter((t) =>
    ["underpaid", "overpaid", "unmatched", "misdirected"].includes(t.status),
  ).length;

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-mono text-[var(--color-ink-faint)]">
            Transactions
          </p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
            Every transfer, fee, and match.
          </h1>
          <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Audit gross receipts, transparent platform fees, and the net amount
            credited to customer ledgers.
          </p>
        </div>
        <Link href="/reports" className="btn-primary justify-center text-sm">
          Open reports
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Gross received"
          value={formatNaira(gross)}
          detail={`${formatNumber(allTransactions.length)} transfers`}
          tone="green"
        />
        <SummaryCard
          label="Fees"
          value={formatNaira(fees)}
          detail="Deducted transparently"
        />
        <SummaryCard
          label="Net credited"
          value={formatNaira(net)}
          detail="Customer ledger balance"
          tone="green"
        />
        <SummaryCard
          label="Review queue"
          value={formatNumber(reviewCount)}
          detail="Short, overpaid, or misdirected"
          tone="amber"
        />
      </div>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`rounded-[var(--radius-sm)] border px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                }`}
                onClick={() => {
                  setStatusFilter(option.value);
                  setPage(1);
                }}
              >
                {option.label}
                {option.value !== "all"
                  ? ` (${allTransactions.filter((t) => t.status === option.value).length})`
                  : null}
              </button>
            ))}
          </div>
          <input
            className="input max-w-xs"
            placeholder="Search by name or reference..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {paged.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-10 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm text-[var(--color-ink-muted)]">
              {search || statusFilter !== "all"
                ? "No transactions match your filters."
                : "No transactions yet. Once a customer makes a payment it will appear here."}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 lg:hidden">
              {paged.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
            <TransactionsTable transactions={paged} />
          </>
        )}

        {totalPages > 1 ? (
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="text-sm text-[var(--color-ink-muted)]">
              Page {page} of {totalPages} ({formatNumber(filtered.length)}{" "}
              total)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {misdirected.length > 0 ? (
        <section className="mt-8 rounded-[var(--radius-card)] border border-[rgba(217,124,72,0.34)] bg-[rgba(217,124,72,0.12)] p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-heading)]">
                Misdirected payments
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
                These transfers landed in the payment rail but need manual
                review before customer ledger credit.
              </p>
            </div>
            <span className="rounded-full border border-[rgba(217,124,72,0.34)] bg-[var(--color-surface-raised)] px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
              {formatNumber(misdirected.length)} open
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {misdirected.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-[var(--radius-sm)] border border-[rgba(217,124,72,0.24)] bg-[var(--color-surface-raised)] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      {transaction.sender_account_name} from{" "}
                      {transaction.sender_bank_name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      {transaction.reconciliation_note}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--color-heading)]">
                    {formatNaira(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
