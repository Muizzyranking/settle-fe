import Link from "next/link";
import { getCollections } from "@/lib/settle/api";
import { formatNaira, formatNumber, percent } from "@/lib/settle/format";
import type { CollectionSummary } from "@/lib/settle/types";

export const metadata = {
  title: "Collections",
};

function getScheduleLabel(collection: CollectionSummary) {
  if (!collection.recurrence) {
    return "One-time";
  }

  if (collection.recurrence.frequency === "custom") {
    return `Every ${collection.recurrence.interval_days ?? 0} days`;
  }

  return `${collection.recurrence.frequency[0].toUpperCase()}${collection.recurrence.frequency.slice(1)}`;
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
      <p className="text-mono text-[var(--color-ink-faint)]">{label}</p>
      <p className="mt-4 text-2xl font-semibold text-[var(--color-heading)]">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">{detail}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "green" | "amber" | "red" | "muted" | "blue";
}) {
  const toneClass = {
    green: "text-[var(--color-primary)]",
    amber: "text-[#8A5D14]",
    red: "text-[#B91C1C]",
    muted: "text-[var(--color-ink-muted)]",
    blue: "text-[#25638A]",
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

function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const expectedTotal = collection.expected_amount * collection.total_accounts;
  const progress = percent(collection.amount_collected, expectedTotal);
  const showOverdue = collection.recurrence !== null;

  return (
    <article className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">
              {collection.name}
            </h2>
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-ink-muted)]">
              {getScheduleLabel(collection)}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {collection.description}
          </p>
        </div>
        <Link href={`/collections/${collection.id}`} className="btn-ghost min-h-0 text-sm">
          Open details
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div>
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
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-ink-muted)]">
            <span>{formatNaira(expectedTotal)} expected total</span>
            <span>{formatNaira(collection.amount_outstanding)} outstanding</span>
            <span>{formatNumber(collection.total_accounts)} accounts</span>
          </div>
        </div>

        <div className="rounded-[var(--radius-sm)] bg-[var(--color-emerald-950)] p-4 text-[var(--color-sand-50)]">
          <p className="text-xs text-[var(--color-sand-300)]">Expected per account</p>
          <p className="mt-2 text-xl font-semibold">{formatNaira(collection.expected_amount)}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniMetric label="Paid" value={collection.total_paid} tone="green" />
        <MiniMetric label="Underpaid" value={collection.total_underpaid} tone="amber" />
        <MiniMetric label="Unpaid" value={collection.total_unpaid} tone="muted" />
        {showOverdue ? (
          <MiniMetric label="Overdue" value={collection.total_overdue} tone="red" />
        ) : (
          <MiniMetric label="Collected" value={formatNaira(collection.amount_collected, true)} tone="green" />
        )}
      </div>
    </article>
  );
}

export default async function CollectionsPage() {
  const collections = await getCollections();
  const totalExpected = collections.reduce(
    (sum, collection) => sum + collection.expected_amount * collection.total_accounts,
    0,
  );
  const totalCollected = collections.reduce(
    (sum, collection) => sum + collection.amount_collected,
    0,
  );
  const totalOutstanding = collections.reduce(
    (sum, collection) => sum + collection.amount_outstanding,
    0,
  );
  const recurringCount = collections.filter((collection) => collection.recurrence !== null).length;
  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-mono text-[var(--color-ink-faint)]">Collections</p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
            Payment groups that stay reconciled.
          </h1>
          <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Track rent, service charges, school fees, and other grouped payments through
            dedicated customer accounts.
          </p>
        </div>
        <Link href="/collections/new" className="btn-primary justify-center text-sm">
          New collection
        </Link>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total expected"
          value={formatNaira(totalExpected)}
          detail={`${formatNumber(collections.length)} collection groups`}
        />
        <SummaryCard
          label="Collected"
          value={formatNaira(totalCollected)}
          detail={`${percent(totalCollected, totalExpected)}% of expected value`}
        />
        <SummaryCard
          label="Outstanding"
          value={formatNaira(totalOutstanding)}
          detail="Includes unpaid and underpaid accounts"
        />
        <SummaryCard
          label="Recurring"
          value={formatNumber(recurringCount)}
          detail="Collections with due-status tracking"
        />
      </div>
      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">
              Active collections
            </h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Open a collection to see who has paid, underpaid, or still needs a reminder.
            </p>
          </div>
          <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm text-[var(--color-ink-muted)]">
            {formatNumber(collections.length)} showing
          </div>
        </div>
        <div className="grid gap-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>
    </>
  );
}
