import Link from "next/link";
import { DeleteAccountButton } from "@/components/accounts/delete-account-button";
import { BackLink } from "@/components/app/back-link";
import { CopyButton } from "@/components/app/copy-button";
import {
  getAccountDetail,
  getCollections,
  getTransactions,
} from "@/lib/settle/api";
import {
  formatDate,
  formatDateTime,
  formatNaira,
  formatNumber,
} from "@/lib/settle/format";
import { getPaymentStatusMeta } from "@/lib/settle/status";
import type { AccountSummary, TransactionRecord } from "@/lib/settle/types";

export const metadata = {
  title: "Account detail",
};

const paymentOrigin =
  process.env.NEXT_PUBLIC_SETTLE_MARKETING_ORIGIN ??
  "https://settle.muizzyranking.me";

function DetailStat({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "green" | "amber" | "red";
}) {
  const toneClass = {
    default: "text-[var(--color-heading)]",
    green: "text-[var(--color-primary)]",
    amber: "text-[#8A5D14]",
    red: "text-[#B91C1C]",
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

function StatusBadge({ account }: { account: AccountSummary }) {
  const status = getPaymentStatusMeta(account.payment_status);

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
    >
      {status.label}
    </span>
  );
}

function DuePanel({ account }: { account: AccountSummary }) {
  const dueStatus = account.due_status;

  if (!dueStatus) {
    return null;
  }

  return (
    <div
      className={`rounded-[var(--radius-card)] border p-5 ${
        dueStatus.is_overdue
          ? "border-[rgba(185,28,28,0.22)] bg-[rgba(185,28,28,0.08)]"
          : "border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
      }`}
    >
      <p className="text-sm font-semibold text-[var(--color-ink)]">
        {dueStatus.is_overdue
          ? `${formatNumber(dueStatus.days_overdue ?? 0)} days overdue`
          : `${formatNumber(dueStatus.days_until_due ?? 0)} days until due`}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        Next due date is {formatDate(dueStatus.next_due_date)}. Last paid{" "}
        {formatDateTime(dueStatus.last_paid_at)}.
      </p>
    </div>
  );
}

function TransactionList({
  transactions,
}: {
  transactions: TransactionRecord[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] p-8 text-center">
        <h2 className="text-lg font-semibold text-[var(--color-heading)]">
          No payments received yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Once a customer transfers into this dedicated account, matched
          payments will appear here with fees and net credited amount.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {transactions.map((transaction) => {
          const status = getPaymentStatusMeta(transaction.status);

          return (
            <article
              key={transaction.id}
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">
                    {transaction.reference}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                    {formatDateTime(transaction.paid_at)}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
                  <p className="text-[11px] text-[var(--color-ink-faint)]">
                    Gross
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                    {formatNaira(transaction.amount)}
                  </p>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
                  <p className="text-[11px] text-[var(--color-ink-faint)]">
                    Fee
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                    {formatNaira(transaction.platform_fee)}
                  </p>
                </div>
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
                  <p className="text-[11px] text-[var(--color-ink-faint)]">
                    Net
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                    {formatNaira(transaction.net_amount)}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] md:block">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-ink-faint)]">
              <th className="px-5 py-3 font-medium">Reference</th>
              <th className="px-5 py-3 font-medium">Gross</th>
              <th className="px-5 py-3 font-medium">Fee</th>
              <th className="px-5 py-3 font-medium">Net credited</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Paid at</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const status = getPaymentStatusMeta(transaction.status);

              return (
                <tr
                  key={transaction.id}
                  className="border-b border-[var(--color-border)] last:border-b-0"
                >
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
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                    {formatDateTime(transaction.paid_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [account, collections, transactions] = await Promise.all([
    getAccountDetail(id),
    getCollections(),
    getTransactions(id),
  ]);
  const collection = collections.find(
    (item) => item.id === account.collection_id,
  );
  const paymentLink = `${paymentOrigin}/pay/${account.id}`;
  const remaining = Math.max(0, account.expected_amount - account.total_paid);
  const accountContext = collection
    ? `${account.description} in ${collection.name}.`
    : account.description || "Standalone customer account.";

  return (
    <>
      <div className="mb-6">
        <BackLink href="/accounts" label="Back to accounts" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-mono text-[var(--color-ink-faint)]">
                Account detail
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-display-lg text-[var(--color-heading)]">
                  {account.customer_name}
                </h1>
                <StatusBadge account={account} />
              </div>
              <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
                {accountContext}
              </p>
            </div>
            <Link href="/transactions" className="btn-ghost min-h-0 text-sm">
              View all transactions
            </Link>
          </div>

          <div className="mt-8 account-card rounded-[var(--radius-card)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-sand-300)]">
                  Dedicated Nomba account
                </p>
                <p className="mt-3 font-mono text-3xl font-semibold tracking-[0.08em] text-[var(--color-sand-50)] sm:text-4xl">
                  {account.bank_account_number}
                </p>
                <p className="mt-2 text-sm text-[var(--color-sand-200)]">
                  {account.bank_account_name}
                </p>
                <p className="text-sm text-[var(--color-sand-300)]">
                  {account.bank_name}
                </p>
              </div>
              <CopyButton
                value={account.bank_account_number}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-btn)] bg-[var(--color-sand-50)] px-4 text-sm font-medium text-[var(--color-emerald-900)]"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailStat
              label="Expected"
              value={formatNaira(account.expected_amount)}
              detail="Amount due for this account"
            />
            <DetailStat
              label="Paid"
              value={formatNaira(account.total_paid)}
              detail="Gross customer transfers"
              tone="green"
            />
            <DetailStat
              label="Net balance"
              value={formatNaira(account.balance)}
              detail="After Settle fees"
              tone="green"
            />
            <DetailStat
              label="Remaining"
              value={formatNaira(remaining)}
              detail={remaining > 0 ? "Still outstanding" : "No shortfall"}
              tone={remaining > 0 ? "amber" : "green"}
            />
          </div>

          <section className="mt-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-heading)]">
                  Account statement
                </h2>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  Gross received, platform fee, and net credited for each
                  matched payment.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-ink)]"
              >
                Download receipt
              </button>
            </div>
            <TransactionList transactions={transactions} />
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-mono text-[var(--color-ink-faint)]">Customer</p>
            <div className="mt-5 grid gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                  Reference
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                  {account.customer_ref}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                  Email
                </p>
                <p className="mt-1 break-words text-sm text-[var(--color-ink-muted)]">
                  {account.customer_email ?? "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                  Phone
                </p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  {account.customer_phone ?? "Not provided"}
                </p>
              </div>
            </div>
          </div>

          <DuePanel account={account} />

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-mono text-[var(--color-ink-faint)]">
              Payment page
            </p>
            <p className="mt-4 break-all text-sm font-medium text-[var(--color-ink)]">
              {paymentLink}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <CopyButton
                value={paymentLink}
                label="Copy payment link"
                className="btn-primary justify-center text-sm"
              />
              <Link
                href={`/pay/${account.id}`}
                className="btn-ghost justify-center text-sm"
              >
                Preview public page
              </Link>
            </div>
          </div>

          <DeleteAccountButton
            accountId={account.id}
            customerName={account.customer_name}
          />
        </aside>
      </div>
    </>
  );
}
