import Link from "next/link";

type BackLinkProps = {
  href: string;
  label: string;
};

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
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
      <span>{label}</span>
    </Link>
  );
}
