import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo/Logo";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthShellVariant = "split" | "reverse" | "centered";
type AuthVisual = "payments" | "setup" | "mail";

const highlights = [
  ["Dedicated accounts", "Every customer gets a unique transfer destination."],
  ["Automatic matching", "Payments resolve to the right person as they land."],
  ["Clean records", "Balances, alerts, and receipts stay in one place."],
];

function PaymentsPreview() {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-float)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
            Today
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-ink)]">
            Sunshine Estates
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-bg-subtle)] px-3 py-1 text-[10px] font-medium text-[var(--color-primary)]">
          Live
        </span>
      </div>

      <div className="grid gap-3 py-5">
        {[
          ["Emeka Okafor", "Unit 12B", "₦45,000"],
          ["Fatima Bello", "Unit 14A", "₦45,000"],
          ["Chidi Okonkwo", "Office 3F", "₦120,000"],
        ].map(([name, ref, amount]) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-ink)]">{name}</p>
              <p className="text-xs text-[var(--color-ink-faint)]">{ref}</p>
            </div>
            <p className="text-sm font-semibold text-[var(--color-primary)]">{amount}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[var(--radius-sm)] bg-[var(--color-emerald-950)] p-4 text-[var(--color-sand-50)]">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-sand-300)]">
          Settlement health
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-mono)" }}>
            98.4%
          </p>
          <p className="max-w-[14ch] text-right text-xs leading-relaxed text-[var(--color-sand-300)]">
            matched without review
          </p>
        </div>
      </div>
    </div>
  );
}

function SetupPreview() {
  return (
    <div className="grid gap-4">
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-emerald-950)] p-5 text-[var(--color-sand-50)] shadow-[var(--shadow-float)]">
        <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-sand-300)]">
          Workspace setup
        </p>
        <h2 className="mt-4 max-w-[12ch] text-display-md text-[var(--color-sand-50)]">
          Your first collection list.
        </h2>
        <div className="mt-6 grid gap-3">
          {["Business profile", "Customer accounts", "Payment alerts"].map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-[var(--radius-sm)] bg-[rgba(250,246,236,0.08)] px-4 py-3"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(250,246,236,0.14)] text-[10px] font-semibold">
                {index + 1}
              </span>
              <span className="text-sm text-[var(--color-sand-100)]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
            Avg. time
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--color-heading)]">4 min</p>
        </div>
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
            Manual rows
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--color-heading)]">0</p>
        </div>
      </div>
    </div>
  );
}

function MailPreview() {
  return (
    <div className="mx-auto max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-float)]">
      <div className="rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] p-4">
        <div className="h-2 w-24 rounded-full bg-[var(--color-border-strong)]" />
        <div className="mt-4 h-2 w-full rounded-full bg-[var(--color-border)]" />
        <div className="mt-2 h-2 w-3/4 rounded-full bg-[var(--color-border)]" />
        <div className="mt-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 py-3 text-center text-sm font-medium text-[var(--color-primary-contrast)]">
          Verify email
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-[var(--color-ink-faint)]">
        <span>Settle verification</span>
        <span>Just now</span>
      </div>
    </div>
  );
}

function Visual({ type }: { type: AuthVisual }) {
  if (type === "setup") {
    return <SetupPreview />;
  }

  if (type === "mail") {
    return <MailPreview />;
  }

  return <PaymentsPreview />;
}

function BrandFooter() {
  return (
    <footer className="flex flex-col gap-3 border-t border-[var(--color-border)] py-5 text-xs text-[var(--color-ink-faint)] sm:flex-row sm:items-center sm:justify-between">
      <p>&copy; 2026 Settle</p>
      <span className="inline-flex items-center gap-2">
        <span>Built with</span>
        <span className="inline-flex h-7 items-center rounded-[var(--radius-sm)] bg-[var(--color-emerald-950)] px-3">
          <Image
            src="/nomba-developers-logo.svg"
            alt="Nomba Developers"
            width={91}
            height={24}
            className="h-4 w-auto"
          />
        </span>
      </span>
    </footer>
  );
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  visual = "payments",
  variant = "split",
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  visual?: AuthVisual;
  variant?: AuthShellVariant;
  children: React.ReactNode;
}) {
  const reverse = variant === "reverse";
  const sideTitle = reverse
    ? "Start with the business, not the spreadsheet."
    : "Run collections with fewer loose ends.";
  const sideSubtitle = reverse
    ? "Create a workspace for the business first, then invite payments into a structure that is already organized."
    : "Settle gives your business a calm payment workspace: customer accounts, reconciled transfers, and notifications that tell the full story.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-bg)]">
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 opacity-[0.28]
          bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)]
          bg-[size:4rem_4rem]
        "
      />
      <div className="container-settle relative z-10 flex min-h-screen flex-col">
        <header className="flex h-20 items-center justify-between">
          <Link href="/" aria-label="Settle home">
            <Logo variant="full" size={28} scheme="auto" />
          </Link>
          <ThemeToggle />
        </header>

        {variant === "centered" ? (
          <div className="grid flex-1 place-items-center py-10">
            <div className="w-full max-w-2xl">
              <div className="mb-7 text-center">
                <p className="text-mono text-[var(--color-ink-faint)]">{eyebrow}</p>
                <h1 className="mx-auto mt-4 max-w-[12ch] text-display-lg text-[var(--color-heading)]">
                  {title}
                </h1>
                <p className="mx-auto mt-4 max-w-[48ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {subtitle}
                </p>
              </div>
              <div className="mb-7 hidden sm:block">
                <Visual type={visual} />
              </div>
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-float)] sm:p-7">
                {children}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`
              grid flex-1 gap-10 pb-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.82fr)]
              lg:items-center lg:gap-16 lg:pb-16
              ${reverse ? "lg:grid-cols-[minmax(24rem,0.82fr)_minmax(0,0.9fr)]" : ""}
            `}
          >
            <section className={reverse ? "order-2 lg:order-2" : "order-1"}>
              <div className="mb-6">
                <p className="text-mono text-[var(--color-ink-faint)]">{eyebrow}</p>
                <h1 className="mt-4 max-w-[12ch] text-display-lg text-[var(--color-heading)] lg:text-display-lg">
                  {sideTitle}
                </h1>
                <p className="mt-5 max-w-[46ch] text-body-lg text-[var(--color-ink-muted)]">
                  {sideSubtitle}
                </p>
              </div>

              <div className="grid gap-3">
                {highlights.map(([label, body]) => (
                  <div
                    key={label}
                    className="flex gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-ink)]">{label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                        {body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 hidden lg:block">
                <Visual type={visual} />
              </div>
            </section>

            <section className={reverse ? "order-1 lg:order-1" : "order-2"}>
              <div className={`mb-6 lg:hidden ${reverse ? "" : "hidden"}`}>
                <p className="text-mono text-[var(--color-ink-faint)]">{eyebrow}</p>
                <h2 className="mt-4 text-display-md text-[var(--color-heading)]">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {subtitle}
                </p>
                <div className="mt-5 flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-xs text-[var(--color-ink-muted)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  <span>Dedicated accounts, automatic matching, clean records.</span>
                </div>
              </div>

              <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-float)] sm:p-7">
                <div className="hidden lg:block">
                  <p className="text-mono text-[var(--color-ink-faint)]">{eyebrow}</p>
                  <h2 className="mt-4 text-display-md text-[var(--color-heading)]">{title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {subtitle}
                  </p>
                </div>

                <div className="lg:mt-8">{children}</div>
              </div>
            </section>
          </div>
        )}

        <BrandFooter />
      </div>
    </main>
  );
}
