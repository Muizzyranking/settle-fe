import Link from "next/link";
import { getDashboardOverview } from "@/lib/settle/api";
import { formatDateTime, formatNaira, formatNumber, percent } from "@/lib/settle/format";
import { getPaymentStatusMeta } from "@/lib/settle/status";
import type {
  CollectionSummary,
  DashboardAttentionItem,
  DashboardTransaction,
} from "@/lib/settle/types";

export const metadata = {
  title: "Dashboard",
};

function StatCard({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "amber" | "red";
}) {
  const toneClass =
    tone === "red"
      ? "text-[#B91C1C]"
      : tone === "amber"
        ? "text-[#8A5D14]"
        : "text-[var(--color-heading)]";

  return (
    <div className="min-h-[132px] rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-ink-faint)]">
        {label}
      </p>
      <p className={`mt-3 text-xl font-semibold sm:text-2xl ${toneClass}`}>{value}</p>
      <p className="mt-2 text-xs leading-relaxed text-[var(--color-ink-muted)] sm:text-sm">
        {detail}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "green" | "amber" | "red" | "muted";
}) {
  const toneClass = {
    green: "text-[var(--color-primary)]",
    amber: "text-[#8A5D14]",
    red: "text-[#B91C1C]",
    muted: "text-[var(--color-ink-muted)]",
  }[tone];

  return (
    <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] px-3 py-3">
      <p className={`text-lg font-semibold ${toneClass}`}>
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      <p className="mt-1 text-[11px] font-medium text-[var(--color-ink-faint)]">{label}</p>
    </div>
  );
}

function CollectionHealthCard({ collection }: { collection: CollectionSummary }) {
  const expectedTotal = collection.expected_amount * collection.total_accounts;
  const progress = percent(collection.amount_collected, expectedTotal);
  const showOverdue = collection.recurrence !== null;

  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[var(--color-ink)]">
            {collection.name}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {collection.description}
          </p>
        </div>
        <Link href={`/collections/${collection.id}`} className="btn-ghost min-h-0 shrink-0 text-sm">
          Open
        </Link>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium text-[var(--color-ink-faint)]">
          <span>{formatNaira(collection.amount_collected)} collected</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-subtle)]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Paid" value={collection.total_paid} tone="green" />
        <Metric label="Underpaid" value={collection.total_underpaid} tone="amber" />
        <Metric label="Unpaid" value={collection.total_unpaid} tone="muted" />
        {showOverdue ? (
          <Metric label="Overdue" value={collection.total_overdue} tone="red" />
        ) : (
          <Metric label="Collected" value={formatNaira(collection.amount_collected, true)} tone="green" />
        )}
      </div>
    </article>
  );
}

function AttentionItem({ item }: { item: DashboardAttentionItem }) {
  const toneClass = {
    amber: "border-[rgba(190,160,106,0.36)] bg-[rgba(190,160,106,0.12)]",
    red: "border-[rgba(185,28,28,0.22)] bg-[rgba(185,28,28,0.08)]",
    blue: "border-[rgba(61,130,180,0.24)] bg-[rgba(61,130,180,0.08)]",
  }[item.tone];

  return (
    <Link
      href={item.href}
      className={`block rounded-[var(--radius-card)] border p-4 no-underline transition-transform hover:-translate-y-0.5 ${toneClass}`}
    >
      <p className="text-sm font-semibold text-[var(--color-ink)]">{item.label}</p>
      <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-muted)]">
        {item.detail}
      </p>
    </Link>
  );
}

function TransactionCard({ transaction }: { transaction: DashboardTransaction }) {
  const status = getPaymentStatusMeta(transaction.status);

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
        <p className="shrink-0 text-sm font-semibold text-[var(--color-heading)]">
          {formatNaira(transaction.amount)}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
        <p className="text-xs text-[var(--color-ink-muted)]">
          {formatDateTime(transaction.paid_at)}
        </p>
      </div>
    </article>
  );
}

function TransactionsTable({ transactions }: { transactions: DashboardTransaction[] }) {
  return (
    <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-[var(--shadow-card)] md:block">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-ink-faint)]">
            <th className="px-5 py-3 font-medium">Customer</th>
            <th className="px-5 py-3 font-medium">Collection</th>
            <th className="px-5 py-3 font-medium">Amount</th>
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
                    {transaction.customer_name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                    {transaction.sender_bank_name}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-[var(--color-ink-muted)]">
                  {transaction.collection_name}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-[var(--color-ink)]">
                  {formatNaira(transaction.amount)}
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
  );
}

export default async function DashboardPage() {
  const dashboard = await getDashboardOverview();
  const attentionItems = dashboard.attention_items.filter((item) => item.href !== "/settings");

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-mono text-[var(--color-ink-faint)]">Overview</p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
            Collection command center.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
            See what came in, what is still outstanding, and where to follow up today.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
          <Link href="/collections/new" className="btn-primary justify-center text-sm">
            New collection
          </Link>
          <Link
            href="/accounts"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-ink)] no-underline transition-colors hover:bg-[var(--color-bg-subtle)]"
          >
            Add account
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:mt-8 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label="Collected"
          value={formatNaira(dashboard.total_collected)}
          detail={`${formatNumber(dashboard.total_transactions)} payments matched`}
        />
        <StatCard
          label="Outstanding"
          value={formatNaira(dashboard.total_outstanding)}
          detail="Expected but not fully received"
          tone="amber"
        />
        <StatCard
          label="Overdue"
          value={formatNumber(dashboard.total_overdue_accounts)}
          detail="Recurring accounts past due"
          tone="red"
        />
        <StatCard
          label="Accounts"
          value={formatNumber(dashboard.total_accounts)}
          detail={`${formatNumber(dashboard.total_collections)} active collections`}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-heading)]">
                Collection health
              </h2>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                Paid, underpaid, unpaid, and overdue counts by collection.
              </p>
            </div>
            <Link href="/collections" className="btn-ghost min-h-0 shrink-0 text-sm">
              View all
            </Link>
          </div>

          <div className="grid gap-4">
            {dashboard.collection_health.map((collection) => (
              <CollectionHealthCard key={collection.id} collection={collection} />
            ))}
          </div>
        </section>

        <aside>
          <h2 className="text-lg font-semibold text-[var(--color-heading)]">Needs attention</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Follow up on short or overdue payments.
          </p>
          <div className="mt-4 grid gap-3">
            {attentionItems.map((item) => (
              <AttentionItem key={item.id} item={item} />
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">
              Recent payments
            </h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Last updated {formatDateTime(dashboard.generated_at)}
            </p>
          </div>
          <Link href="/transactions" className="btn-ghost min-h-0 text-sm">
            View transactions
          </Link>
        </div>

        <div className="grid gap-3 md:hidden">
          {dashboard.recent_transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
        <TransactionsTable transactions={dashboard.recent_transactions} />
      </section>
    </>
  );
}
