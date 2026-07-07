import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { MailIcon } from "@/components/icons";

export const metadata = {
  title: "Check your email",
};

export default function CheckEmailPage() {
  return (
    <AuthShell
      eyebrow="Verify email"
      title="Check your email"
      subtitle="We sent a verification link to the address you used. Open it to finish setting up your Settle account."
      visual="mail"
      variant="centered"
    >
      <div className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-primary)]">
          <MailIcon />
        </div>

        <h2 className="mt-6 text-display-md text-[var(--color-heading)]">
          Check your email
        </h2>
        <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Your verification link should arrive shortly. Once verified, you can
          log in and start creating customer payment accounts.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/auth/login"
            className="btn-primary justify-center text-[15px]"
          >
            Go to login
          </Link>
          <Link
            href="/auth/register"
            className="
              inline-flex min-h-12 items-center justify-center rounded-[var(--radius-btn)]
              border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-ink)]
              transition-colors hover:bg-[var(--color-bg-subtle)]
            "
          >
            Use another email
          </Link>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-[var(--color-ink-faint)]">
          No email yet? Check spam or promotions, then request another
          verification email.
        </p>
      </div>
    </AuthShell>
  );
}
