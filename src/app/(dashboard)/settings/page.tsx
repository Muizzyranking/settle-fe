import Link from "next/link";
import { getFinanceOverview, getSettingsOverview } from "@/lib/settle/api";
import { formatNumber } from "@/lib/settle/format";
import { ProfileForm } from "./profile-form";
import { ApiKeySection } from "./api-key-section";
import { WebhookSection } from "./webhook-section";
import { BankAccountsSection } from "./bank-accounts";
import { SecuritySection } from "./security-section";

export const metadata = {
  title: "Settings",
};

function SectionHeader({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-mono text-[var(--color-ink-faint)]">{label}</p>
      <h2 className="mt-3 text-xl font-semibold text-[var(--color-heading)]">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
        {description}
      </p>
    </div>
  );
}

export default async function SettingsPage() {
  const [settings, finance] = await Promise.all([
    getSettingsOverview(),
    getFinanceOverview(),
  ]);

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-mono text-[var(--color-ink-faint)]">Settings</p>
          <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
            Business, API, and webhook controls.
          </h1>
          <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-[var(--color-ink-muted)]">
            Keep profile details current, manage developer access, test webhook
            delivery, and maintain payout bank accounts.
          </p>
        </div>
        <Link href="/developers" className="btn-primary justify-center text-sm">
          Developer docs
        </Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-6">
          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <SectionHeader
              label="Profile"
              title="Business profile"
              description="Update your business details and contact information."
            />
            <ProfileForm tenant={settings.tenant} />
          </section>

          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <SectionHeader
              label="API"
              title="API key"
              description="Generate or rotate a tenant key. The full key is shown once after generation."
            />
            <ApiKeySection apiKeyPrefix={settings.tenant.api_key_prefix} />
          </section>

          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <SectionHeader
              label="Webhook"
              title="Webhook delivery"
              description="Signed test delivery proves real-time developer integrations are configured."
            />
            <WebhookSection webhook={settings.webhook} />
          </section>

          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <SectionHeader
              label="Security"
              title="Session management"
              description="End active sessions or change your credentials if needed."
            />
            <div className="mt-6">
              <SecuritySection />
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-mono text-[var(--color-ink-faint)]">Account</p>
            <div className="mt-5 grid gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                  Email
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-[var(--color-ink)]">
                  {settings.tenant.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                  Saved banks
                </p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                  {formatNumber(finance.saved_bank_accounts.length)} of 3
                  configured
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-ink-faint)]">
                  Backend docs
                </p>
                <Link
                  href={settings.docs_url}
                  className="btn-ghost min-h-0 text-sm"
                >
                  Open Swagger docs
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-mono text-[var(--color-ink-faint)]">
              Bank accounts
            </p>
            <BankAccountsSection accounts={finance.saved_bank_accounts} />
          </div>
        </aside>
      </div>
    </>
  );
}
