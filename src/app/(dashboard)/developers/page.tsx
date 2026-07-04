import Link from "next/link";
import { BackLink } from "@/components/app/back-link";

export const metadata = {
  title: "Developer docs",
};

const docs = [
  {
    title: "API keys",
    description: "Generate keys, copy the prefix, and connect Settle to your product.",
    href: "/settings",
  },
  {
    title: "Webhooks",
    description: "Receive payment updates when transfers are matched or need review.",
    href: "/settings",
  },
  {
    title: "Public payment links",
    description: "Share account payment pages with customers from collections and accounts.",
    href: "/collections",
  },
];

export default async function DevelopersPage() {
  return (
    <>
      <div className="mb-6">
        <BackLink href="/dashboard" label="Back to overview" />
      </div>
      <div>
        <p className="text-mono text-[var(--color-ink-faint)]">Developers</p>
        <h1 className="mt-3 max-w-4xl text-display-lg text-[var(--color-heading)]">
          Connect Settle to your product.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Use API keys, webhooks, and payment links when you are ready to integrate.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {docs.map((doc) => (
          <Link
            key={doc.title}
            href={doc.href}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 no-underline shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
          >
            <h2 className="text-lg font-semibold text-[var(--color-heading)]">{doc.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              {doc.description}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
