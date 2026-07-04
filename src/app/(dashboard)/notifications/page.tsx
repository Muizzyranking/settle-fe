import Link from "next/link";
import { BackLink } from "@/components/app/back-link";
import { getNotifications } from "@/lib/settle/api";
import { formatDateTime } from "@/lib/settle/format";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  return (
    <>
      <div className="mb-6">
        <BackLink href="/dashboard" label="Back to overview" />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-mono text-[var(--color-ink-faint)]">Notifications</p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
            Recent payment updates.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Follow matched payments, short payments, and account activity from one place.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-[var(--shadow-card)] sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-[var(--color-heading)]">
                    {notification.title}
                  </h2>
                  {!notification.is_read ? (
                    <span className="rounded-full bg-[var(--color-accent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-white">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {notification.message}
                </p>
              </div>
              <p className="shrink-0 text-xs text-[var(--color-ink-faint)]">
                {formatDateTime(notification.created_at)}
              </p>
            </div>
            {notification.data?.collection_id ? (
              <Link
                href={`/collections/${notification.data.collection_id}`}
                className="btn-ghost mt-3 min-h-0 text-sm"
              >
                Open collection
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}
