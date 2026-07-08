import Link from "next/link";
import { BackLink } from "@/components/app/back-link";

export const metadata = {
  title: "Developer docs",
};

export default async function DevelopersPage() {
  return (
    <>
      <div className="mb-6">
        <BackLink href="/dashboard" label="Back to overview" />
      </div>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-subtle)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-8 w-8 text-[var(--color-ink-muted)]"
            aria-hidden="true"
          >
            <path
              d="M8 7 4 12l4 5M16 7l4 5-4 5M13.5 5.5l-3 13"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-display-md text-[var(--color-heading)] mb-3">
          Developer docs — coming soon
        </h1>
        <p className="max-w-lg text-sm text-[var(--color-ink-muted)] leading-relaxed">
          We are building comprehensive API documentation, SDK examples, and webhook
          guides. In the meantime, head over to{" "}
          <Link href="/settings" className="text-[var(--color-primary)] underline underline-offset-2">
            Settings
          </Link>{" "}
          to generate an API key or configure your webhook endpoint.
        </p>
      </div>
    </>
  );
}
