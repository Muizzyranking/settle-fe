import type { Metadata } from "next";
import { CopyButton } from "@/components/app/copy-button";
import { Logo } from "@/components/logo/Logo";
import { PaymentStatusStream } from "@/components/pay/payment-status-stream";
import { getPublicPaymentPage } from "@/lib/settle/api";
import { formatDate, formatNaira } from "@/lib/settle/format";

type PaymentPageProps = {
  params: Promise<{ account_id: string }>;
};

export const metadata: Metadata = {
  title: "Payment details",
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { account_id: accountId } = await params;
  const payment = await getPublicPaymentPage(accountId);
  const showAmount = payment.expected_amount > 0;
  const isOverdue = payment.next_due_date
    ? new Date(payment.next_due_date).getTime() < Date.now()
    : false;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[760px] flex-col">
        <header className="flex items-center justify-between gap-4 py-2">
          <div className="min-w-0">
            <p className="truncate text-xl font-semibold text-[var(--color-heading)]">
              {payment.business_name}
            </p>
            <p className="mt-1 text-xs font-medium text-[var(--color-ink-faint)]">
              Powered by Settle
            </p>
          </div>
          <Logo variant="mark" size={36} scheme="auto" />
        </header>

        <div className="grid flex-1 content-center gap-4 py-8">
          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-mono text-[var(--color-ink-faint)]">
                  Payment for
                </p>
                <h1 className="mt-3 text-display-md text-[var(--color-heading)]">
                  {payment.customer_name}
                </h1>
                {payment.description ? (
                  <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {payment.description}
                  </p>
                ) : null}
              </div>
              {showAmount ? (
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] px-4 py-3">
                  <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                    Amount due
                  </p>
                  <p className="mt-1 text-xl font-semibold text-[var(--color-heading)]">
                    {formatNaira(payment.expected_amount)}
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <p className="text-sm font-semibold text-[var(--color-ink)]">
              Transfer to this account
            </p>
            <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--color-emerald-950)] p-5 text-[var(--color-sand-50)]">
              <p className="text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-sand-300)]">
                Account number
              </p>
              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-mono text-3xl font-semibold tracking-[0.08em] sm:text-4xl">
                  {payment.bank_account_number}
                </p>
                <CopyButton
                  value={payment.bank_account_number}
                  label="Copy number"
                  copiedLabel="Copied"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-btn)] bg-[var(--color-sand-50)] px-4 text-sm font-medium text-[var(--color-emerald-900)] sm:w-auto"
                />
              </div>
              <p className="mt-3 text-sm text-[var(--color-sand-200)]">
                {payment.bank_name}
              </p>
            </div>

            {payment.next_due_date ? (
              <div
                className={`mt-4 rounded-[var(--radius-sm)] border px-4 py-3 ${
                  isOverdue
                    ? "border-[rgba(185,28,28,0.24)] bg-[rgba(185,28,28,0.08)] text-[#B91C1C]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-ink-muted)]"
                }`}
              >
                <p className="text-sm font-medium">
                  {isOverdue ? "Overdue" : "Due"} {formatDate(payment.next_due_date)}
                </p>
              </div>
            ) : null}
          </section>

          <PaymentStatusStream
            accountId={payment.account_id}
            expectedAmount={payment.expected_amount}
            initialStatus={payment.payment_status}
          />
        </div>

        <footer className="py-4 text-center text-xs text-[var(--color-ink-faint)]">
          Payments are confirmed automatically when the bank transfer lands.
        </footer>
      </div>
    </main>
  );
}
