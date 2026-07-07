import Link from "next/link";
import { CopyButton } from "@/components/app/copy-button";
import { getAccounts, getCollections } from "@/lib/settle/api";
import { formatDate, formatNaira, formatNumber } from "@/lib/settle/format";
import { getPaymentStatusMeta } from "@/lib/settle/status";
import type { AccountSummary, CollectionSummary } from "@/lib/settle/types";

export const metadata = {
  title: "Accounts",
};

function collectionName(
  collections: CollectionSummary[],
  account: AccountSummary,
) {
  return (
    collections.find((collection) => collection.id === account.collection_id)
      ?.name ?? "No collection"
  );
}

function SummaryCard({
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

function DueText({ account }: { account: AccountSummary }) {
  const dueStatus = account.due_status;

  if (!dueStatus) {
    return (
      <span className="text-sm text-[var(--color-ink-faint)]">No schedule</span>
    );
  }

  if (dueStatus.is_overdue) {
    return (
      <span className="text-sm font-medium text-[#B91C1C]">
        {formatNumber(dueStatus.days_overdue ?? 0)} days overdue
      </span>
    );
  }

  return (
    <span className="text-sm text-[var(--color-ink-muted)]">
      Due {formatDate(dueStatus.next_due_date)}
    </span>
  );
}

function AccountCard({
  account,
  collections,
}: {
  account: AccountSummary;
  collections: CollectionSummary[];
}) {
  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-[var(--color-heading)]">
            {account.customer_name}
          </h2>
          <p className="mt-1 truncate text-xs text-[var(--color-ink-faint)]">
            {collectionName(collections, account)} · {account.customer_ref}
          </p>
        </div>
        <StatusBadge account={account} />
      </div>

      <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-4">
        <p className="text-xs font-medium text-[var(--color-ink-faint)]">
          Virtual account
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-mono text-lg font-semibold tracking-[0.08em] text-[var(--color-ink)]">
            {account.bank_account_number}
          </p>
          <CopyButton value={account.bank_account_number} />
        </div>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          {account.bank_name}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
          <p className="text-[11px] font-medium text-[var(--color-ink-faint)]">
            Expected
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
            {formatNaira(account.expected_amount)}
          </p>
        </div>
        <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
          <p className="text-[11px] font-medium text-[var(--color-ink-faint)]">
            Net balance
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
            {formatNaira(account.balance)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <DueText account={account} />
        <Link
          href={`/accounts/${account.id}`}
          className="btn-ghost min-h-0 text-sm"
        >
          Open
        </Link>
      </div>
    </article>
  );
}

function AccountsTable({
  accounts,
  collections,
}: {
  accounts: AccountSummary[];
  collections: CollectionSummary[];
}) {
  return (
    <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] lg:block">
      <table className="w-full min-w-[980px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-ink-faint)]">
            <th className="px-5 py-3 font-medium">Customer</th>
            <th className="px-5 py-3 font-medium">Virtual account</th>
            <th className="px-5 py-3 font-medium">Collection</th>
            <th className="px-5 py-3 font-medium">Expected</th>
            <th className="px-5 py-3 font-medium">Paid</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Due</th>
            <th className="px-5 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr
              key={account.id}
              className="border-b border-[var(--color-border)] last:border-b-0"
            >
              <td className="px-5 py-4">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {account.customer_name}
                </p>
                <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                  {account.customer_ref}
                </p>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm font-semibold text-[var(--color-ink)]">
                    {account.bank_account_number}
                  </p>
                  <CopyButton value={account.bank_account_number} />
                </div>
                <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                  {account.bank_name}
                </p>
              </td>
              <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                {collectionName(collections, account)}
              </td>
              <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                {formatNaira(account.expected_amount)}
              </td>
              <td className="px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">
                {formatNaira(account.total_paid)}
              </td>
              <td className="px-5 py-4">
                <StatusBadge account={account} />
              </td>
              <td className="px-5 py-4">
                <DueText account={account} />
              </td>
              <td className="px-5 py-4">
                <Link
                  href={`/accounts/${account.id}`}
                  className="btn-ghost min-h-0 text-sm"
                >
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AccountsPage() {
  const [accounts, collections] = await Promise.all([
    getAccounts(),
    getCollections(),
  ]);
  const paidCount = accounts.filter(
    (account) => account.payment_status === "exact",
  ).length;
  const reviewCount = accounts.filter((account) =>
    ["underpaid", "overpaid", "misdirected", "unmatched"].includes(
      account.payment_status,
    ),
  ).length;
  const overdueCount = accounts.filter(
    (account) => account.due_status?.is_overdue,
  ).length;
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-mono text-[var(--color-ink-faint)]">Accounts</p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
            Dedicated accounts for every customer.
          </h1>
          <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Review Nomba virtual accounts, copy payment details, and see
            reconciliation status across collections.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Link
            href="/accounts/new"
            className="btn-primary justify-center text-sm"
          >
            New account
          </Link>
          <Link
            href="/collections"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-ink)] no-underline transition-colors hover:bg-[var(--color-bg-subtle)]"
          >
            Choose collection
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Active accounts"
          value={formatNumber(accounts.length)}
          detail={`${formatNumber(collections.length)} collections represented`}
        />
        <SummaryCard
          label="Paid exactly"
          value={formatNumber(paidCount)}
          detail="Fully reconciled accounts"
          tone="green"
        />
        <SummaryCard
          label="Needs review"
          value={formatNumber(reviewCount)}
          detail="Underpaid, overpaid, or unmatched"
          tone="amber"
        />
        <SummaryCard
          label="Overdue"
          value={formatNumber(overdueCount)}
          detail={`${formatNaira(totalBalance)} net balance visible`}
          tone="red"
        />
      </div>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">
              Provisioned accounts
            </h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              One row per customer, grouped into collections for tracking.
            </p>
          </div>
          <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
            {formatNumber(accounts.length)} showing
          </div>
        </div>

        <div className="grid gap-4 lg:hidden">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              collections={collections}
            />
          ))}
        </div>
        <AccountsTable accounts={accounts} collections={collections} />
      </section>
    </>
  );
}
