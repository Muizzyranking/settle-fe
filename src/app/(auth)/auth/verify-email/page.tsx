import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { MailIcon } from "@/components/icons";
import { buildBackendUrl } from "@/lib/settle/auth";

export const metadata = {
  title: "Verify your email",
};

type VerifyResult =
  | { ok: true }
  | { ok: false; expired: boolean };

async function verifyToken(token: string): Promise<VerifyResult> {
  const url = buildBackendUrl(
    `auth/verify-email?token=${encodeURIComponent(token)}`,
  );

  if (!url) {
    return { ok: false, expired: false };
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  if (response.ok) {
    return { ok: true };
  }

  return { ok: false, expired: response.status === 400 };
}

function SuccessView() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-emerald-200)] bg-[var(--color-emerald-50)] text-[var(--color-primary)]">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <path
            d="M9 17l6 6 10-10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="mt-6 text-display-md text-[var(--color-heading)]">
        Email verified
      </h2>
      <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
        Your email has been verified successfully. You can now log in and start
        using Settle.
      </p>

      <div className="mt-8">
        <Link href="/auth/login" className="btn-primary justify-center text-[15px]">
          Go to login
        </Link>
      </div>
    </div>
  );
}

function ExpiredView() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-accent)]">
        <MailIcon />
      </div>

      <h2 className="mt-6 text-display-md text-[var(--color-heading)]">
        Link expired
      </h2>
      <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
        This verification link has expired or already been used. Please log in
        to request a new one.
      </p>

      <div className="mt-8">
        <Link href="/auth/login" className="btn-primary justify-center text-[15px]">
          Go to login
        </Link>
      </div>
    </div>
  );
}

function MissingTokenView() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-ink-faint)]">
        <MailIcon />
      </div>

      <h2 className="mt-6 text-display-md text-[var(--color-heading)]">
        No verification link
      </h2>
      <p className="mx-auto mt-3 max-w-[38ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
        No verification token was found in the link. Make sure you used the
        full link from the email.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link href="/auth/login" className="btn-primary justify-center text-[15px]">
          Go to login
        </Link>
        <Link
          href="/auth/register"
          className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-btn)] border border-[var(--color-border)] px-5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg-subtle)]"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell
        eyebrow="Verify email"
        title="Check your link"
        subtitle="We couldn't find a verification token in the link you used."
        visual="mail"
        variant="centered"
      >
        <MissingTokenView />
      </AuthShell>
    );
  }

  const result = await verifyToken(token);

  if (result.ok) {
    return (
      <AuthShell
        eyebrow="Verify email"
        title="All set"
        subtitle="Your email has been verified and your account is ready."
        visual="mail"
        variant="centered"
      >
        <SuccessView />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Verify email"
      title="Link expired"
      subtitle="The verification link you used is no longer valid."
      visual="mail"
      variant="centered"
    >
      <ExpiredView />
    </AuthShell>
  );
}
