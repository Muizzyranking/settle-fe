"use client";

import Link from "next/link";
import { Reveal } from "./reveal";

export function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Create a collection & add customers.",
      body: "Set up a payment purpose (e.g. 'June Rent'), add your customers with their amounts. Each person gets a dedicated Nomba account number automatically.",
    },
    {
      n: "2",
      title: "Share their unique account number.",
      body: "Each customer gets a payment page with their own bank account number. Send the link once — they save it and pay via their bank app whenever they're ready.",
    },
    {
      n: "3",
      title: "Payments reconcile themselves.",
      body: "When money hits any account, Settle matches it to the right customer, deducts fees, and updates their balance in real time. You see exactly who has paid and who hasn't.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="section-gap bg-[var(--color-bg-subtle)] border-t border-[var(--color-border)]"
    >
      <div className="container-settle">
        <Reveal>
          <p className="text-mono text-[var(--color-ink-faint)] mb-3">How it works</p>
          <h2 className="text-display-lg text-[var(--color-heading)] mb-12 max-w-[22ch]">
            Three steps to never chase payments again.
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
          {steps.map(({ n, title, body }, i) => (
            <Reveal key={n} delay={i * 0.1}>
              <div
                className="
                  shrink-0 snap-center
                  w-[78vw] sm:w-[56vw] lg:w-auto
                  bg-[var(--color-surface-raised)] rounded-[var(--radius-card)]
                  p-6 border border-[var(--color-border)]
                  flex flex-col gap-3
                "
              >
                <span className="text-mono text-[var(--color-accent)]">{n}</span>
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
            <Link href="/auth/register" className="btn-primary text-[15px]">
              Create your free account
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
