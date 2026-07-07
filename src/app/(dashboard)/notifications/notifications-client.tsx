"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateTime } from "@/lib/settle/format";
import type { Notification } from "@/lib/settle/types";

export function NotificationsClient({
  notifications: initial,
}: {
  notifications: Notification[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [items, setItems] = useState(initial);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const filtered =
    filter === "unread" ? items.filter((n) => !n.is_read) : items;
  const unreadCount = items.filter((n) => !n.is_read).length;

  async function markAsRead(id: string) {
    setMarkingId(id);

    await fetch(`/api/settle/notifications/${id}/read`, {
      method: "PATCH",
    });

    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setMarkingId(null);
  }

  async function markAllAsRead() {
    await fetch("/api/settle/notifications/read-all", {
      method: "PATCH",
    });

    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    router.refresh();
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] text-sm font-medium text-[var(--color-primary)] no-underline transition-colors hover:text-[var(--color-heading)]"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
            <path
              d="M12.5 4.5 7 10l5.5 5.5M7.5 10H16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Back to overview</span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-mono text-[var(--color-ink-faint)]">
            Notifications
          </p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
            Recent payment updates.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Follow matched payments, short payments, and account activity from
            one place.
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            className="btn-primary justify-center text-sm"
            onClick={markAllAsRead}
          >
            Mark all as read ({unreadCount})
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          className={`rounded-[var(--radius-sm)] border px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all"
              ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]"
              : "border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
          onClick={() => setFilter("all")}
        >
          All ({items.length})
        </button>
        <button
          type="button"
          className={`rounded-[var(--radius-sm)] border px-4 py-2 text-sm font-medium transition-colors ${
            filter === "unread"
              ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]"
              : "border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-10 text-center shadow-[var(--shadow-card)]">
            <p className="text-sm text-[var(--color-ink-muted)]">
              {filter === "unread"
                ? "No unread notifications."
                : "No notifications yet. When a customer makes a payment you will see it here."}
            </p>
          </div>
        ) : (
          filtered.map((notification) => (
            <button
              key={notification.id}
              type="button"
              disabled={markingId === notification.id || notification.is_read}
              className="block w-full cursor-pointer text-left disabled:cursor-default"
              onClick={() => {
                if (!notification.is_read) markAsRead(notification.id);
              }}
            >
              <article
                className={`rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-card)] transition-colors sm:p-5 ${
                  notification.is_read
                    ? "border-[var(--color-border)] bg-[var(--color-surface-raised)]"
                    : "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]"
                }`}
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open collection
                  </Link>
                ) : null}
              </article>
            </button>
          ))
        )}
      </div>
    </>
  );
}
