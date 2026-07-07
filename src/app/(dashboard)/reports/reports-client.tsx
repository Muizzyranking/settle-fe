"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDateTime, formatNaira, formatNumber } from "@/lib/settle/format";
import { getPaymentStatusMeta } from "@/lib/settle/status";
import type { AccountSummary, ReportsOverview } from "@/lib/settle/types";

function SummaryCard({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "green" | "amber";
}) {
  const toneClass = {
    default: "text-[var(--color-heading)]",
    green: "text-[var(--color-primary)]",
    amber: "text-[#8A5D14]",
  }[tone];

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
      <p className="text-mono text-[var(--color-ink-faint)]">{label}</p>
      <p className={`mt-4 text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{detail}</p>
    </div>
  );
}

function buildCsv(report: ReportsOverview) {
  const header = [
    "collection",
    "expected_total",
    "collected",
    "fees",
    "net_credited",
    "outstanding",
    "reconciliation_rate",
  ];
  const rows = report.collections.map((collection) => [
    collection.name,
    collection.expected_total,
    collection.collected,
    collection.fees,
    collection.net_credited,
    collection.outstanding,
    `${collection.reconciliation_rate}%`,
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}

export function ReportsClient({
  report,
  accounts,
}: {
  report: ReportsOverview;
  accounts: AccountSummary[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(buildCsv(report))}`;

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts.slice(0, 3);

    const q = searchQuery.toLowerCase();
    return accounts.filter(
      (a) =>
        a.customer_name.toLowerCase().includes(q) ||
        a.customer_ref.toLowerCase().includes(q),
    );
  }, [accounts, searchQuery]);

  const selectedAccount = searchQuery.trim()
    ? filteredAccounts[0] ?? null
    : null;

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-mono text-[var(--color-ink-faint)]">Reports</p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
            Reconciliation that can be audited.
          </h1>
          <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Export collection performance, platform fees, and per-account statements without
            exposing backend tokens in the browser.
          </p>
        </div>
        <a href={csvHref} download="settle-reconciliation-report.csv" className="btn-primary text-sm">
          Export CSV
        </a>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Expected"
          value={formatNaira(report.total_expected)}
          detail="All active collection targets"
        />
        <SummaryCard
          label="Collected"
          value={formatNaira(report.total_collected)}
          detail={`${formatNumber(report.reconciliation_rate)}% reconciliation rate`}
          tone="green"
        />
        <SummaryCard
          label="Fees"
          value={formatNaira(report.total_fees)}
          detail="Transparent Settle fee total"
        />
        <SummaryCard
          label="Outstanding"
          value={formatNaira(report.total_outstanding)}
          detail="Unpaid and underpaid balance"
          tone="amber"
        />
      </div>

      <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">
              Reconciliation rate
            </h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Generated {formatDateTime(report.generated_at)}
            </p>
          </div>
          <p className="text-2xl font-semibold text-[var(--color-primary)]">
            {formatNumber(report.reconciliation_rate)}%
          </p>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)]"
            style={{ width: `${report.reconciliation_rate}%` }}
          />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {report.status_breakdown.map((item) => {
            const meta = getPaymentStatusMeta(item.status);

            return (
              <div
                key={item.status}
                className={`rounded-[var(--radius-sm)] border p-4 ${meta.className}`}
              >
                <p className="text-sm font-semibold">{meta.label}</p>
                <p className="mt-2 text-xl font-semibold">{formatNumber(item.count)}</p>
                <p className="mt-1 text-xs opacity-75">{formatNaira(item.amount)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">
              Collection report
            </h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Gross collected, fee deduction, and ledger credit by collection.
            </p>
          </div>
          <Link href="/collections" className="btn-ghost min-h-0 text-sm">
            View collections
          </Link>
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-ink-faint)]">
                <th className="px-5 py-3 font-medium">Collection</th>
                <th className="px-5 py-3 font-medium">Expected</th>
                <th className="px-5 py-3 font-medium">Collected</th>
                <th className="px-5 py-3 font-medium">Fees</th>
                <th className="px-5 py-3 font-medium">Net credited</th>
                <th className="px-5 py-3 font-medium">Outstanding</th>
                <th className="px-5 py-3 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              {report.collections.map((collection) => (
                <tr
                  key={collection.id}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/collections/${collection.id}`}
                      className="text-sm font-semibold text-[var(--color-ink)] no-underline hover:text-[var(--color-primary)]"
                    >
                      {collection.name}
                    </Link>
                    <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                      {formatNumber(collection.exact_count)} paid ·{" "}
                      {formatNumber(collection.underpaid_count)} underpaid ·{" "}
                      {formatNumber(collection.unpaid_count)} unpaid
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                    {formatNaira(collection.expected_total)}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">
                    {formatNaira(collection.collected)}
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                    {formatNaira(collection.fees)}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">
                    {formatNaira(collection.net_credited)}
                  </td>
                  <td className="px-5 py-4 text-sm text-[#8A5D14]">
                    {formatNaira(collection.outstanding)}
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                    {formatNumber(collection.reconciliation_rate)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[var(--color-heading)]">
            Statement lookup
          </h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Search for a customer account by name or reference to view their statement.
          </p>
        </div>

        <div className="mb-5">
          <input
            className="input max-w-md"
            placeholder="Search by customer name or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {searchQuery.trim() && !selectedAccount ? (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-10 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm text-[var(--color-ink-muted)]">
              No account found matching "{searchQuery}".
            </p>
          </div>
        ) : null}

        {selectedAccount ? (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--color-heading)]">
                  {selectedAccount.customer_name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  {selectedAccount.customer_ref} · {selectedAccount.bank_account_number}
                </p>
              </div>
              <Link
                href={`/accounts/${selectedAccount.id}`}
                className="btn-primary text-sm"
              >
                View statement
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4">
              <div>
                <p className="text-xs text-[var(--color-ink-faint)]">Gross paid</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-ink)]">
                  {formatNaira(selectedAccount.total_paid)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-ink-faint)]">Balance</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-heading)]">
                  {formatNaira(selectedAccount.balance)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredAccounts.map((account) => {
              const status = getPaymentStatusMeta(account.payment_status);

              return (
                <Link
                  key={account.id}
                  href={`/accounts/${account.id}`}
                  className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 no-underline shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--color-ink)]">
                        {account.customer_name}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                        {account.customer_ref}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
                      <p className="text-[11px] text-[var(--color-ink-faint)]">Gross</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                        {formatNaira(account.total_paid)}
                      </p>
                    </div>
                    <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
                      <p className="text-[11px] text-[var(--color-ink-faint)]">Net</p>
                      <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                        {formatNaira(account.balance)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
