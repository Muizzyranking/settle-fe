"use client";

import Image from "next/image";
import { Logomark } from "@/components/logo/Logo";
import { Reveal } from "./reveal";

export function NombaTrust() {
  return (
    <section
      className="
        section-gap border-t border-[var(--color-border)]
        text-center relative overflow-hidden
      "
    >
      {/* Faint watermark card in background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]
        "
      >
        <Logomark size={260} scheme="auto" aria-hidden />
      </div>

      <div className="container-settle relative z-10">
        <Reveal>
          <p className="text-mono text-[var(--color-ink-faint)] mb-6">Powered by</p>

          <div className="inline-flex items-center gap-2 mb-6">
            <div
              className="
                inline-flex h-12 items-center rounded-[var(--radius-sm)]
                border border-[var(--color-border)] bg-[var(--color-emerald-950)]
                px-5 shadow-[var(--shadow-card)]
              "
            >
              <Image
                src="/nomba-developers-logo.svg"
                alt="Nomba Developers"
                width={91}
                height={24}
                className="h-5 w-auto"
              />
            </div>
          </div>

          <p className="text-body-lg text-[var(--color-ink-muted)] max-w-[50ch] mx-auto">
            Every virtual account and every transfer on Settle runs on Nomba&apos;s
            licensed payment infrastructure — the same rails trusted by thousands of
            Nigerian businesses.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 text-xs text-[var(--color-ink-faint)] sm:flex-row">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6L4.5 8.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              CBN-licensed infrastructure
            </span>
            <span className="hidden w-px h-3 bg-[var(--color-border)] sm:block" aria-hidden="true" />
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6L4.5 8.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Real account numbers, real banks
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
