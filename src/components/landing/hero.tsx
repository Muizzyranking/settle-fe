"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { AccountCard } from "./account-card";

function NombaDevelopersLogo() {
  return (
    <span className="inline-flex h-7 items-center rounded-full bg-[var(--color-emerald-950)] px-3">
      <Image
        src="/nomba-developers-logo.svg"
        alt="Nomba Developers"
        width={91}
        height={24}
        className="h-4 w-auto"
      />
    </span>
  );
}

/* ── Mini stat cards (floating near the AccountCard) ─────────── */
function FloatingStats() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -left-4 lg:-left-10 top-1/4 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-card)] px-3 py-2 shadow-[var(--shadow-card)] z-10"
      >
        <p className="text-[10px] text-[var(--color-ink-faint)]">Matched today</p>
        <p className="text-sm font-semibold text-[var(--color-primary)]">₦2.4M</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -right-2 lg:-right-6 top-[15%] bg-[var(--color-surface-raised)] border border-[var(--color-border-strong)] rounded-[var(--radius-card)] px-3 py-2 shadow-[var(--shadow-card)] z-10"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
          <p className="text-[10px] text-[var(--color-primary)] font-medium">Live</p>
        </div>
        <p className="text-sm font-semibold text-[var(--color-ink)]">12 payments</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -bottom-2 lg:-bottom-5 left-1/4 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-card)] px-3 py-2 shadow-[var(--shadow-card)] z-10"
      >
        <p className="text-[10px] text-[var(--color-ink-faint)]">Time saved / week</p>
        <p className="text-sm font-semibold text-[var(--color-ink)]">~8 hrs</p>
      </motion.div>
    </>
  );
}

/* ── Hero section ────────────────────────────────────────────── */
export function Hero() {
  return (
    <section
      id="hero"
      className="
        relative min-h-[calc(100dvh-1rem)] flex items-center
        pt-24 pb-16 lg:pt-28 lg:pb-20
        overflow-hidden
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 opacity-[0.35]
          bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)]
          bg-[size:4rem_4rem]
        "
      />

      <div className="container-settle w-full relative z-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.82fr)] lg:items-center lg:gap-12">

          {/* ── Copy side ── */}
          <div className="max-w-[34rem]">

            {/* Hackathon pill */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8"
            >
              <span className="pill">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]"
                  aria-hidden="true"
                />
                <span>DevCareer hackathon</span>
                <NombaDevelopersLogo />
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-display-xl text-[var(--color-heading)] mb-6"
            >
              Collect payments
              <br />
              <em className="not-italic text-[var(--color-heading-accent)]">without</em>
              <br />
              the guesswork.
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="text-body-lg text-[var(--color-ink-muted)] mb-10 max-w-[44ch]"
            >
              Give every customer their own bank account number. When they transfer money,
              Settle automatically matches the payment, updates their balance, and notifies
              you — no manual checking, no spreadsheets, no guessing who paid.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <Link href="/auth/register" className="btn-primary text-[15px] w-full sm:w-auto justify-center">
                Get started free
              </Link>
              <a href="#how-it-works" className="btn-ghost w-full sm:w-auto justify-center">
                See how it works
              </a>
            </motion.div>
          </div>

          {/* ── Card side ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center px-3 lg:px-0 relative"
          >
            <AccountCard />
            <FloatingStats />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
