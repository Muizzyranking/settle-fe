"use client";

import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo/Logo";

const footerSections = [
  {
    title: "Product",
    links: [
      ["Features", "#features"],
      ["How it works", "#how-it-works"],
      ["Developers", "#developers"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Log in", "/auth/login"],
      ["Create account", "/auth/register"],
      ["Email verification", "/auth/check-email"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-emerald-950)] border-t border-[rgba(250,246,236,0.06)]">
      <div className="container-settle py-12 lg:py-16">
        <div className="mb-12 grid gap-8 border-b border-[rgba(250,246,236,0.08)] pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-xl">
            <Logo variant="full" size={28} scheme="dark" />
            <h2 className="mt-8 max-w-[16ch] text-display-md text-[var(--color-sand-50)]">
              Payments tracked before they become admin work.
            </h2>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-[var(--color-sand-300)]">
              Give customers dedicated account numbers, reconcile transfers automatically,
              and keep your records tidy without opening another spreadsheet.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/auth/register" className="btn-primary justify-center text-sm">
              Create account
            </Link>
            <Link
              href="/auth/login"
              className="
                inline-flex min-h-12 items-center justify-center rounded-[var(--radius-btn)]
                border border-[rgba(250,246,236,0.16)] px-5 text-sm font-medium
                text-[var(--color-sand-50)] transition-colors
                hover:bg-[rgba(250,246,236,0.08)]
              "
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
          <div className="grid gap-8 sm:grid-cols-2">
            {footerSections.map((section) => (
              <nav key={section.title} aria-label={`${section.title} footer navigation`}>
                <p className="mb-4 text-mono text-[var(--color-sand-500)]">{section.title}</p>
                <ul className="space-y-3">
                  {section.links.map(([label, href]) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-sm text-[var(--color-sand-300)] no-underline transition-colors hover:text-[var(--color-sand-50)]"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="rounded-[var(--radius-card)] border border-[rgba(250,246,236,0.10)] bg-[rgba(250,246,236,0.04)] p-5">
            <p className="text-mono text-[var(--color-sand-500)]">Built with</p>
            <div className="mt-4 inline-flex h-11 items-center rounded-[var(--radius-sm)] bg-[rgba(0,0,0,0.26)] px-4">
              <Image
                src="/nomba-developers-logo.svg"
                alt="Nomba Developers"
                width={91}
                height={24}
                className="h-5 w-auto"
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[var(--color-sand-300)]">
              Submitted for the DevCareer and Nomba hackathon.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[rgba(250,246,236,0.08)] pt-6 text-[10px] text-[var(--color-sand-500)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Settle. All rights reserved.</p>
          <p>Payment collection for Nigerian SMEs.</p>
        </div>
      </div>
    </footer>
  );
}
