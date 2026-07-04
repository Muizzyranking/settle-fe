import Link from "next/link";
import { AppShell } from "@/components/app/app-shell";
import { BackLink } from "@/components/app/back-link";
import { getAccounts, getCollectionDetail, getTenantProfile } from "@/lib/settle/api";
import { formatDate, formatNaira, formatNumber, percent } from "@/lib/settle/format";
import { getPaymentStatusMeta } from "@/lib/settle/status";
import type { AccountSummary, CollectionSummary } from "@/lib/settle/types";

export const metadata = {
  title: "Collection detail",
};

function getScheduleLabel(collection: CollectionSummary) {
  if (!collection.recurrence) {
    return "One-time collection";
  }

  if (collection.recurrence.frequency === "custom") {
    return `Every ${collection.recurrence.interval_days ?? 0} days`;
  }

  return `${collection.recurrence.frequency[0].toUpperCase()}${collection.recurrence.frequency.slice(1)} collection`;
}

function DetailStat({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "amber" | "red" | "green";
}) {
  const toneClass = {
    default: "text-[var(--color-heading)]",
    amber: "text-[#8A5D14]",
    red: "text-[#B91C1C]",
    green: "text-[var(--color-primary)]",
  }[tone];

  return (
    <div className="flex min-h-[132px] flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
      <p className="text-mono text-[var(--color-ink-faint)]">{label}</p>
      <p className={`mt-4 text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{detail}</p>
    </div>
  );
}

function StatusPill({ account }: { account: AccountSummary }) {
  const status = getPaymentStatusMeta(account.payment_status);

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
      {status.label}
    </span>
  );
}

function DueStatusPill({ account }: { account: AccountSummary }) {
  const dueStatus = account.due_status;

  if (!dueStatus) {
    return (
      <span className="text-sm text-[var(--color-ink-faint)]">
        Not scheduled
      </span>
    );
  }

  if (dueStatus.is_overdue) {
    return (
      <span className="inline-flex rounded-full border border-[rgba(185,28,28,0.22)] bg-[rgba(185,28,28,0.08)] px-3 py-1 text-xs font-medium text-[#B91C1C]">
        {formatNumber(dueStatus.days_overdue ?? 0)} days overdue
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-[color-mix(in_srgb,var(--color-primary)_32%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
      Due {formatDate(dueStatus.next_due_date)}
    </span>
  );
}

function AccountsTable({
  accounts,
  showDueColumn,
}: {
  accounts: AccountSummary[];
  showDueColumn: boolean;
}) {
  if (accounts.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] p-8 text-center">
        <h3 className="text-lg font-semibold text-[var(--color-heading)]">
          No sample account rows yet
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--color-ink-muted)]">
          The collection summary can still preview this state while account provisioning is
          added in the next phase.
        </p>
        <Link href="/accounts" className="btn-primary mt-5 justify-center text-sm">
          Add accounts
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {accounts.map((account) => (
          <article
            key={account.id}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-card)]"
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
              <StatusPill account={account} />
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
                <p className="text-[11px] font-medium text-[var(--color-ink-faint)]">Paid</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                  {formatNaira(account.total_paid)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-3">
              <p className="text-[11px] font-medium text-[var(--color-ink-faint)]">
                Account number
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                {account.bank_account_number}
              </p>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{account.bank_name}</p>
            </div>

            {showDueColumn ? (
              <div className="mt-4">
                <DueStatusPill account={account} />
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] md:block">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-ink-faint)]">
            <th className="px-5 py-3 font-medium">Customer</th>
            <th className="px-5 py-3 font-medium">Account</th>
            <th className="px-5 py-3 font-medium">Expected</th>
            <th className="px-5 py-3 font-medium">Paid</th>
            <th className="px-5 py-3 font-medium">Net balance</th>
            <th className="px-5 py-3 font-medium">Status</th>
            {showDueColumn ? <th className="px-5 py-3 font-medium">Due</th> : null}
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
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {account.bank_account_number}
                </p>
                <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                  {account.bank_name}
                </p>
              </td>
              <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                {formatNaira(account.expected_amount)}
              </td>
              <td className="px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">
                {formatNaira(account.total_paid)}
              </td>
              <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                {formatNaira(account.balance)}
              </td>
              <td className="px-5 py-4">
                <StatusPill account={account} />
              </td>
              {showDueColumn ? (
                <td className="px-5 py-4">
                  <DueStatusPill account={account} />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [tenant, collection, accounts] = await Promise.all([
    getTenantProfile(),
    getCollectionDetail(id),
    getAccounts(id),
  ]);
  const expectedTotal = collection.expected_amount * collection.total_accounts;
  const progress = percent(collection.amount_collected, expectedTotal);
  const showDueColumn = collection.recurrence !== null;

  return (
    <AppShell tenant={tenant} activeHref="/collections">
      <div className="mb-6">
        <BackLink href="/collections" label="Back to collections" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-mono text-[var(--color-ink-faint)]">Collection detail</p>
              <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
                {collection.name}
              </h1>
              <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
                {collection.description}
              </p>
            </div>
            <Link href="/accounts" className="btn-primary justify-center text-sm">
              Add accounts
            </Link>
          </div>

          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  Collection progress
                </p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  {formatNaira(collection.amount_collected)} of {formatNaira(expectedTotal)}
                </p>
              </div>
              <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink-muted)]">
                {progress}% collected
              </span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
              <div
                className="h-full rounded-full bg-[var(--color-primary)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <DetailStat
              label="Paid"
              value={formatNumber(collection.total_paid)}
              detail="Accounts fully matched"
              tone="green"
            />
            <DetailStat
              label="Underpaid"
              value={formatNumber(collection.total_underpaid)}
              detail="Payment received but short"
              tone="amber"
            />
            <DetailStat
              label="Unpaid"
              value={formatNumber(collection.total_unpaid)}
              detail="No payment matched yet"
            />
            {showDueColumn ? (
              <DetailStat
                label="Overdue"
                value={formatNumber(collection.total_overdue)}
                detail="Recurring accounts past due"
                tone="red"
              />
            ) : (
              <DetailStat
                label="Accounts"
                value={formatNumber(collection.total_accounts)}
                detail="One-time collection"
              />
            )}
          </div>

          <section className="mt-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-heading)]">
                  Related accounts
                </h2>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  Showing {formatNumber(accounts.length)} sample records from{" "}
                  {formatNumber(collection.total_accounts)} accounts.
                </p>
              </div>
              <Link href="/transactions" className="btn-ghost min-h-0 text-sm">
                View transactions
              </Link>
            </div>
            <AccountsTable accounts={accounts} showDueColumn={showDueColumn} />
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-mono text-[var(--color-ink-faint)]">Setup</p>
            <div className="mt-5 grid gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                  Expected per account
                </p>
                <p className="mt-1 text-xl font-semibold text-[var(--color-heading)]">
                  {formatNaira(collection.expected_amount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-ink-faint)]">Schedule</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
                  {getScheduleLabel(collection)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                  Outstanding
                </p>
                <p className="mt-1 text-xl font-semibold text-[#8A5D14]">
                  {formatNaira(collection.amount_outstanding)}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
