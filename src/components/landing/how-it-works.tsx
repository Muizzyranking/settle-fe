"use client";

import Link from "next/link";
import { Reveal } from "./reveal";

export function HowItWorks() {
  const steps = [
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
