"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { Logo, Logomark } from "@/components/logo/Logo";
import { AccountCard } from "./account-card";
import { Nav } from "./nav";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Feature section (alternating layout) ───────────────────── */
interface FeatureProps {
  index: string;
  headline: string;
  body: string;
  visual: React.ReactNode;
  flip?: boolean;
}

function FeatureSection({ index, headline, body, visual, flip = false }: FeatureProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <div ref={ref} className="section-gap border-t border-[var(--color-border)]">
      <div className="container-settle">
        <div
          className={`
            flex flex-col gap-10
            lg:flex-row lg:items-center lg:gap-16
            ${flip ? "lg:flex-row-reverse" : ""}
          `}
        >
          {/* Visual — always first on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2 flex items-center justify-center"
          >
            {visual}
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: flip ? -20 : 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full lg:w-1/2"
          >
            <span
              className="text-mono text-[var(--color-ink-faint)] block mb-4"
              aria-hidden="true"
            >
              {index}
            </span>
            <h3 className="text-display-md text-[var(--color-emerald-900)] mb-4">
              {headline}
            </h3>
            <p className="text-body-lg text-[var(--color-ink-muted)] max-w-[42ch]">
              {body}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ─── Reconcile visual (before → after) ──────────────────────── */
function ReconcileVisual() {
  const items = [
    { raw: "TRF/0123/EMEKA OKAFOR", resolved: "Emeka Okafor — Unit 12B — Paid in full", ok: true },
    { raw: "TRF/0456/FAT BELLO",    resolved: "Fatima Bello — Unit 14A — Paid in full", ok: true },
    { raw: "TRF/0789/UNKNOWN",      resolved: "Unknown — needs review",                 ok: false },
  ];

  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="
        w-full max-w-sm mx-auto rounded-[var(--radius-card)]
        border border-[var(--color-border)] bg-[var(--color-surface)]
        shadow-[var(--shadow-card)] overflow-hidden
      "
    >
      {/* Tab bar */}
      <div className="flex border-b border-[var(--color-border)]">
        {["Before", "After"].map((label, i) => {
          const active = flipped === (i === 1);
          return (
            <button
              key={label}
              onClick={() => setFlipped(i === 1)}
              className={`
                flex-1 py-3 text-sm font-medium transition-colors duration-150
                ${active
                  ? "bg-[var(--color-bg)] text-[var(--color-emerald-700)] border-b-2 border-[var(--color-primary)]"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"}
              `}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {items.map((item, i) => (
          <motion.div
            key={i}
            layout
            className={`
              flex items-start gap-3 p-3 rounded-[var(--radius-sm)]
              transition-colors duration-300
              ${flipped ? "bg-[var(--color-bg)]" : "bg-transparent"}
            `}
          >
            {/* Icon */}
            <span className={`
              mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center
              ${flipped && item.ok
                ? "bg-[var(--color-emerald-100)]"
                : flipped
                  ? "bg-[var(--color-clay-100)]"
                  : "bg-[var(--color-sand-200)]"}
            `}>
              {flipped ? (
                item.ok
                  ? <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke="#1F6F54" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  : <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M2 2L6 6M6 2L2 6" stroke="#C2622D" strokeWidth="1.5" strokeLinecap="round"/></svg>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-sand-400)]" />
              )}
            </span>

            {/* Text */}
            <div className="min-w-0">
              <motion.div
                key={flipped ? "after" : "before"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: i * 0.07 }}
                className="text-xs leading-snug"
                style={{ fontFamily: flipped ? "var(--font-body)" : "var(--font-mono)" }}
              >
                <span className={flipped
                  ? item.ok ? "text-[var(--color-ink)]" : "text-[var(--color-clay-600)]"
                  : "text-[var(--color-ink-muted)]"}
                >
                  {flipped ? item.resolved : item.raw}
                </span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Notifications visual ────────────────────────────────────── */
function NotifyVisual() {
  const notifications = [
    { time: "Just now",   text: "Emeka Okafor paid ₦45,000 · Unit 12B · Exact",   fresh: true },
    { time: "4 min ago",  text: "Fatima Bello paid ₦45,000 · Unit 14A · Exact",   fresh: false },
    { time: "12 min ago", text: "Chidi Okonkwo paid ₦40,000 · Office 3F · Short ₦80,000", fresh: false },
  ];

  return (
    <div className="w-full max-w-sm mx-auto space-y-2.5">
      {notifications.map((n, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`
            flex items-start gap-3 px-4 py-3.5 rounded-[var(--radius-card)]
            border transition-all
            ${n.fresh
              ? "bg-[var(--color-emerald-50)] border-[var(--color-emerald-200)] shadow-[var(--shadow-card)]"
              : "bg-[var(--color-surface)] border-[var(--color-border)]"}
          `}
        >
          <span className={`
            shrink-0 mt-1 w-2 h-2 rounded-full
            ${n.fresh ? "bg-[var(--color-emerald-500)]" : "bg-[var(--color-sand-300)]"}
          `} />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--color-ink)] leading-snug">{n.text}</p>
            <p className="text-[10px] text-[var(--color-ink-faint)] mt-1">{n.time}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Dev strip code tabs ─────────────────────────────────────── */
const CODE = {
  curl: `curl -X POST https://api.settle.ng/v1/accounts \\
  -H "X-Settle-Key: sk_live_a1b2..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "Emeka Okafor",
    "customer_ref": "unit-12b",
    "collection_id": "uuid",
    "expected_amount": 45000
  }'`,

  javascript: `const res = await fetch("https://api.settle.ng/v1/accounts", {
  method: "POST",
  headers: {
    "X-Settle-Key": "sk_live_a1b2...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    customer_name: "Emeka Okafor",
    customer_ref:  "unit-12b",
    collection_id: "uuid",
    expected_amount: 45000,
  }),
});

const { bank_account_number } = await res.json();
// → "9171424534"`,

  python: `import httpx

client = httpx.Client(
    base_url="https://api.settle.ng/v1",
    headers={"X-Settle-Key": "sk_live_a1b2..."},
)

account = client.post("/accounts", json={
    "customer_name":   "Emeka Okafor",
    "customer_ref":    "unit-12b",
    "collection_id":   "uuid",
    "expected_amount": 45000,
}).json()

print(account["bank_account_number"])
# → "9171424534"`,
};

type Lang = keyof typeof CODE;

function DevStrip() {
  const [lang, setLang] = useState<Lang>("javascript");

  return (
    <section className="bg-[var(--color-emerald-900)] section-gap">
      <div className="container-settle">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <p className="text-mono text-[var(--color-emerald-300)] mb-4">For developers</p>
            <h2 className="text-display-md text-[var(--color-sand-50)] mb-3">
              Building your own flow?
              <br />Settle is also a clean REST API.
            </h2>
            <p className="text-body-lg text-[var(--color-sand-200)] mb-10 max-w-[46ch]">
              Every dashboard action is a documented endpoint. Same API key, same auth, no
              SDKs to install — just HTTP.
            </p>
          </Reveal>

          {/* Code block */}
          <div className="rounded-[var(--radius-card)] overflow-hidden border border-[rgba(250,246,236,0.1)]">
            {/* Language tabs — row on desktop, stacked links on mobile */}
            <div className="flex border-b border-[rgba(250,246,236,0.1)] overflow-x-auto">
              {(Object.keys(CODE) as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`
                    px-5 py-3.5 text-xs font-medium whitespace-nowrap transition-colors duration-150
                    ${lang === l
                      ? "bg-[rgba(250,246,236,0.08)] text-[var(--color-sand-50)] border-b border-[var(--color-emerald-400)]"
                      : "text-[var(--color-sand-200)] hover:text-[var(--color-sand-50)]"}
                  `}
                >
                  {l === "javascript" ? "JavaScript" : l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>

            {/* Code */}
            <motion.pre
              key={lang}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="
                p-5 text-xs leading-relaxed overflow-x-auto
                text-[var(--color-emerald-200)]
                bg-[rgba(7,35,26,0.6)]
              "
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <code>{CODE[lang]}</code>
            </motion.pre>
          </div>

          <Reveal delay={0.1}>
            <a
              href="/docs"
              className="
                inline-flex items-center gap-2 mt-6
                text-sm font-medium text-[var(--color-emerald-300)]
                hover:text-[var(--color-sand-50)] transition-colors duration-150
                underline underline-offset-4 decoration-[var(--color-emerald-600)]
                hover:decoration-[var(--color-emerald-300)]
              "
            >
              Read the API docs
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ──────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-[var(--color-emerald-950)] border-t border-[rgba(250,246,236,0.06)]">
      <div className="container-settle py-12">

        {/* Logo + tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 pb-10 border-b border-[rgba(250,246,236,0.08)]">
          <div>
            <Logo variant="full" size={26} scheme="dark" />
            <p className="text-xs text-[var(--color-sand-300)] mt-3 max-w-[30ch]">
              Payment collection for Nigerian SMEs — no spreadsheet required.
            </p>
          </div>

          <nav className="flex flex-col sm:items-end gap-3" aria-label="Footer navigation">
            {[
              ["Product", "#features"],
              ["How it works", "#how-it-works"],
              ["Developers", "#developers"],
              ["Log in", "/login"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-xs text-[var(--color-sand-300)] hover:text-[var(--color-sand-50)] transition-colors no-underline"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
          <p className="text-[10px] text-[var(--color-sand-500)]">
            © 2025 Settle. Built by{" "}
            <a href="https://devcareers.africa" className="hover:text-[var(--color-sand-300)] no-underline">
              DevCareer
            </a>
            {" "}× Nomba Hackathon.
          </p>
          <span className="pill !bg-[rgba(250,246,236,0.06)] !text-[var(--color-sand-300)] !border-[rgba(250,246,236,0.1)] text-[10px]">
            DevCareer × Nomba
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════
   MAIN LANDING PAGE
═══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Nav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        id="hero"
        className="
          relative min-h-screen flex items-center
          pt-24 pb-16 lg:pt-32 lg:pb-24
          overflow-hidden
        "
      >
        {/* Subtle radial glow — bottom right, adds depth without being loud */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute bottom-0 right-0 w-[600px] h-[600px]
            bg-[radial-gradient(ellipse_at_80%_80%,rgba(31,111,84,0.10),transparent_60%)]
          "
        />

        <div className="container-settle w-full">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">

            {/* ── Copy side ── */}
            <div className="lg:w-[52%] mb-14 lg:mb-0">

              {/* Hackathon pill */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mb-8"
              >
                <span className="pill">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[var(--color-clay-500)]"
                    aria-hidden="true"
                  />
                  DevCareer × Nomba Hackathon
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-display-xl text-[var(--color-emerald-900)] mb-6"
              >
                Get paid
                <br />
                <em className="not-italic text-[var(--color-emerald-600)]">without</em>
                <br />
                the spreadsheet.
              </motion.h1>

              {/* Subhead */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="text-body-lg text-[var(--color-ink-muted)] mb-10 max-w-[44ch]"
              >
                Give every customer their own bank account number. Settle matches every
                transfer, updates their balance, and tells you the moment it lands.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <Link href="/register" className="btn-primary text-[15px] w-full sm:w-auto justify-center">
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
              className="lg:w-[48%] flex items-center justify-center px-4 lg:px-0"
            >
              <AccountCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────── */}
      <section
        aria-label="Product highlights"
        className="border-y border-[var(--color-border)] bg-[var(--color-sand-100)] py-5"
      >
        <div className="container-settle">
          <div
            className="
              flex flex-col sm:flex-row sm:items-center sm:justify-between
              gap-4 sm:gap-0
            "
          >
            <p className="text-label text-[var(--color-ink-muted)] italic" style={{ fontFamily: "var(--font-display)" }}>
              Built for how Nigerian SMEs already collect money
            </p>
            <div className="flex items-center gap-6 sm:gap-8 text-mono text-[var(--color-ink-muted)]">
              {[
                "No bank visits",
                "One link per customer",
                "Real-time, not end-of-day",
              ].map((item, i) => (
                <span key={item} className="flex items-center gap-6 sm:gap-8">
                  {i !== 0 && <span className="hidden sm:block w-px h-3 bg-[var(--color-border)]" aria-hidden="true" />}
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE NARRATIVE ────────────────────────────────── */}
      <div id="features">
        {/* 01 — Collect */}
        <FeatureSection
          index="01"
          headline="One account, one customer, every time."
          body="Each customer gets their own bank account number — permanent, dedicated, uniquely theirs.
                When they pay, you know exactly who it was, what it was for, and whether
                it matched what they owe. No sorting through nameless credit alerts."
          visual={
            <div className="relative w-full max-w-xs mx-auto py-6">
              {/* Stacked cards effect */}
              <div
                aria-hidden="true"
                className="
                  absolute top-4 left-4 right-4
                  h-40 rounded-[1.1rem] opacity-30
                  bg-gradient-to-br from-[var(--color-emerald-700)] to-[var(--color-emerald-900)]
                "
              />
              <div
                aria-hidden="true"
                className="
                  absolute top-2 left-2 right-2
                  h-40 rounded-[1.15rem] opacity-50
                  bg-gradient-to-br from-[var(--color-emerald-600)] to-[var(--color-emerald-800)]
                "
              />
              {/* Front card — static version of the signature element */}
              <div className="account-card relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[var(--color-sand-200)] text-[10px] tracking-widest uppercase mb-0.5">Settle</div>
                    <div className="text-[var(--color-sand-50)] font-semibold text-sm">Sunshine Estates</div>
                  </div>
                  <Logomark scheme="dark" size={28} aria-hidden />
                </div>
                <div className="mb-4">
                  <div className="text-[var(--color-sand-200)] text-[10px] tracking-widest uppercase mb-1">Account</div>
                  <div className="text-[var(--color-sand-50)] tracking-[0.18em] text-sm" style={{ fontFamily: "var(--font-mono)" }}>9171 4245 34</div>
                </div>
                <div>
                  <div className="text-[var(--color-sand-200)] text-[10px] tracking-widest uppercase mb-1">Total received</div>
                  <div className="text-[var(--color-sand-50)] text-xl font-semibold" style={{ fontFamily: "var(--font-mono)" }}>₦45,000</div>
                </div>
              </div>
            </div>
          }
        />

        {/* 02 — Reconcile */}
        <FeatureSection
          index="02"
          headline="No more guessing whose transfer this was."
          body="Every inbound payment is matched to the right customer automatically. Overpaid,
                underpaid, or exact — Settle knows the difference and records it. No end-of-day
                manual matching, no cross-referencing a bank app."
          visual={<ReconcileVisual />}
          flip
        />

        {/* 03 — Notify */}
        <FeatureSection
          index="03"
          headline="Know the moment it lands."
          body="The second a payment hits, you get a notification — in the app, by email, or
                forwarded to your own system. No refreshing. No checking the bank app.
                Just money in, confirmation out."
          visual={<NotifyVisual />}
        />
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="section-gap bg-[var(--color-sand-100)] border-t border-[var(--color-border)]"
      >
        <div className="container-settle">
          <Reveal>
            <p className="text-mono text-[var(--color-ink-faint)] mb-3">How it works</p>
            <h2 className="text-display-lg text-[var(--color-emerald-900)] mb-12 max-w-[22ch]">
              Three steps, then it runs itself.
            </h2>
          </Reveal>

          {/* Steps: horizontal scroll-snap on mobile, 3-col on desktop */}
          <div
            className="
              flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory
              lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:pb-0
              -mx-5 px-5 lg:mx-0 lg:px-0
            "
          >
            {[
              {
                n: "1",
                title: "Add your customers.",
                body: "Name, phone, what they owe — a minute per person, or upload a list all at once.",
              },
              {
                n: "2",
                title: "Share their payment page.",
                body: "Each customer gets one link with their account number on it. Send it once, they save it.",
              },
              {
                n: "3",
                title: "Watch it come in.",
                body: "Every payment shows up reconciled, with the customer's name attached — no spreadsheet required.",
              },
            ].map(({ n, title, body }, i) => (
              <Reveal key={n} delay={i * 0.1}>
                <div
                  className="
                    shrink-0 snap-center
                    w-[78vw] sm:w-[56vw] lg:w-auto
                    bg-[var(--color-bg)] rounded-[var(--radius-card)]
                    p-6 border border-[var(--color-border)]
                    flex flex-col gap-3
                  "
                >
                  <span className="text-mono text-[var(--color-clay-500)]">{n}</span>
                  <h3 className="text-[15px] font-semibold text-[var(--color-ink)] leading-snug">
                    {title}
                  </h3>
                  <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA below steps */}
          <Reveal delay={0.2}>
            <div className="mt-12 text-center">
              <Link href="/register" className="btn-primary text-[15px]">
                Create your free account
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── DEVELOPER STRIP ──────────────────────────────────── */}
      <div id="developers">
        <DevStrip />
      </div>

      {/* ── NOMBA TRUST BLOCK ────────────────────────────────── */}
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
          <Logomark size={260} scheme="light" aria-hidden />
        </div>

        <div className="container-settle relative z-10">
          <Reveal>
            <p className="text-mono text-[var(--color-ink-faint)] mb-6">Powered by</p>

            {/* Nomba wordmark placeholder — swap for official asset from hackathon kit */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div
                className="
                  inline-flex items-center px-5 py-2 rounded-[var(--radius-pill)]
                  border border-[var(--color-border)] bg-[var(--color-surface)]
                  text-[var(--color-ink)] font-semibold text-lg tracking-tight
                "
                aria-label="Nomba"
              >
                {/* TODO: Replace this div with <Image src="/nomba-logo.svg" ... /> once you have the official asset */}
                Nomba
              </div>
            </div>

            <p className="text-body-lg text-[var(--color-ink-muted)] max-w-[50ch] mx-auto">
              Every virtual account and every transfer on Settle runs on Nomba&rsquo;s
              licensed payment infrastructure — the same rails trusted by thousands of
              Nigerian businesses.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3 text-xs text-[var(--color-ink-faint)]">
              <span className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6L4.5 8.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                CBN-licensed infrastructure
              </span>
              <span className="w-px h-3 bg-[var(--color-border)]" aria-hidden="true" />
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

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}
