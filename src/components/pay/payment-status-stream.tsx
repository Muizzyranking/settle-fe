"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateTime, formatNaira } from "@/lib/settle/format";
import type { PaymentStatus } from "@/lib/settle/types";

type PaymentStatusStreamProps = {
  accountId: string;
  expectedAmount: number;
  initialStatus: PaymentStatus;
};

type PaymentUpdate = {
  status?: PaymentStatus;
  amount?: number;
  expected_amount?: number;
  difference?: number;
  transaction_id?: string;
  paid_at?: string;
};

const finalStatuses: PaymentStatus[] = [
  "exact",
  "received",
  "underpaid",
  "overpaid",
  "unmatched",
];

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return (
    value === "unpaid" ||
    value === "exact" ||
    value === "underpaid" ||
    value === "overpaid" ||
    value === "received" ||
    value === "unmatched" ||
    value === "misdirected"
  );
}

function statusCopy(
  status: PaymentStatus,
  update: PaymentUpdate | null,
  expectedAmount: number,
) {
  const amount = update?.amount ?? 0;
  const difference = update?.difference ?? Math.abs(expectedAmount - amount);

  if (status === "exact" || status === "received" || status === "unmatched") {
    return {
      className:
        "border-[color-mix(in_srgb,var(--color-primary)_32%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
      detail: update?.paid_at
        ? `Received ${formatNaira(amount)} on ${formatDateTime(update.paid_at)}.`
        : "The payment has been received.",
      title: "Payment confirmed",
    };
  }

  if (status === "underpaid") {
    return {
      className:
        "border-[rgba(190,160,106,0.36)] bg-[rgba(190,160,106,0.14)] text-[#8A5D14]",
      detail: `Received ${formatNaira(amount)}. Remaining amount is ${formatNaira(difference)}.`,
      title: "Payment received - amount short",
    };
  }

  if (status === "overpaid") {
    return {
      className:
        "border-[rgba(61,130,180,0.28)] bg-[rgba(61,130,180,0.12)] text-[#25638A]",
      detail: `Received ${formatNaira(amount)}. Excess amount is ${formatNaira(difference)}.`,
      title: "Payment received - excess amount",
    };
  }

  if (status === "misdirected") {
    return {
      className:
        "border-[rgba(217,124,72,0.34)] bg-[rgba(217,124,72,0.14)] text-[var(--color-accent)]",
      detail: "The business may need to review this transfer before it is credited.",
      title: "Payment needs review",
    };
  }

  return {
    className:
      "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-ink)]",
    detail: "This page will update automatically once payment is received.",
    title: "Awaiting payment",
  };
}

export function PaymentStatusStream({
  accountId,
  expectedAmount,
  initialStatus,
}: PaymentStatusStreamProps) {
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [update, setUpdate] = useState<PaymentUpdate | null>(null);
  const [connected, setConnected] = useState(false);
  const [streamError, setStreamError] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/settle/pay/${encodeURIComponent(accountId)}/status/stream`,
    );

    eventSource.onopen = () => {
      setConnected(true);
      setStreamError(false);
    };

    eventSource.onerror = () => {
      setConnected(false);
      setStreamError(true);
    };

    const onPaymentUpdate = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as PaymentUpdate;

      if (!isPaymentStatus(payload.status)) {
        return;
      }

      setUpdate(payload);
      setStatus(payload.status);

      if (finalStatuses.includes(payload.status)) {
        eventSource.close();
        setConnected(false);
      }
    };

    eventSource.addEventListener("payment_update", onPaymentUpdate);

    return () => {
      eventSource.removeEventListener("payment_update", onPaymentUpdate);
      eventSource.close();
    };
  }, [accountId]);

  const copy = useMemo(
    () => statusCopy(status, update, expectedAmount),
    [expectedAmount, status, update],
  );

  return (
    <section
      className={`rounded-[var(--radius-card)] border p-6 shadow-[var(--shadow-card)] transition-all ${copy.className}`}
      aria-live="polite"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {status === "unpaid" ? (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-subtle)]">
              <span className="h-3 w-3 rounded-full bg-[var(--color-ink-faint)] animate-pulse" />
            </span>
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8.5L6 11.5L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold">{copy.title}</p>
            <p className="mt-1 text-sm leading-relaxed opacity-80">{copy.detail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-current/10 pt-3 text-xs font-medium">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              connected ? "bg-[var(--color-primary)] animate-pulse" : streamError ? "bg-[var(--color-accent)]" : "bg-[var(--color-ink-faint)]"
            }`}
          />
          {connected ? "Waiting for payment" : streamError ? "Reconnecting..." : "Updated"}
        </div>
      </div>
    </section>
  );
}
