import type { PaymentStatus } from "./types";

export const paymentStatusMeta: Record<
  PaymentStatus,
  {
    label: string;
    description: string;
    className: string;
  }
> = {
  unpaid: {
    label: "Unpaid",
    description: "No payment received yet.",
    className:
      "bg-[var(--color-bg-subtle)] text-[var(--color-ink-muted)] border-[var(--color-border)]",
  },
  exact: {
    label: "Paid",
    description: "Payment matched the expected amount.",
    className:
      "bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_32%,transparent)]",
  },
  received: {
    label: "Received",
    description: "Payment was received and credited.",
    className:
      "bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_32%,transparent)]",
  },
  underpaid: {
    label: "Underpaid",
    description: "Payment received, but below expected amount.",
    className:
      "bg-[rgba(190,160,106,0.18)] text-[#8A5D14] border-[rgba(190,160,106,0.36)]",
  },
  overpaid: {
    label: "Overpaid",
    description: "Payment exceeded expected amount.",
    className:
      "bg-[rgba(61,130,180,0.14)] text-[#25638A] border-[rgba(61,130,180,0.28)]",
  },
  unmatched: {
    label: "Unmatched",
    description: "Payment needs review.",
    className:
      "bg-[rgba(217,124,72,0.16)] text-[var(--color-accent)] border-[rgba(217,124,72,0.34)]",
  },
  misdirected: {
    label: "Misdirected",
    description: "Payment could not be matched to an account.",
    className:
      "bg-[rgba(217,124,72,0.16)] text-[var(--color-accent)] border-[rgba(217,124,72,0.34)]",
  },
};

export function getPaymentStatusMeta(status: PaymentStatus) {
  return paymentStatusMeta[status];
}
