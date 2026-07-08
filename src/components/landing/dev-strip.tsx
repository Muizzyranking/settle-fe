"use client";

import { Reveal } from "./reveal";

export function DevStrip() {
  return (
    <section id="developers" className="bg-[var(--color-emerald-900)] section-gap">
      <div className="container-settle">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <p className="text-mono text-[var(--color-emerald-300)] mb-4">For developers</p>
            <h2 className="text-display-md text-[var(--color-sand-50)] mb-4">
              API &amp; developer docs — coming soon
            </h2>
            <p className="text-body-lg text-[var(--color-sand-200)] mb-8 max-w-[46ch] mx-auto">
              We are putting the finishing touches on comprehensive API documentation,
              SDK examples, and webhook guides. They will be available right here.
            </p>
            <div className="inline-flex items-center gap-3 rounded-[var(--radius-card)] border border-[rgba(250,246,236,0.1)] bg-[rgba(7,35,26,0.6)] px-6 py-4">
              <span className="h-2 w-2 rounded-full bg-[var(--color-emerald-400)] animate-pulse" />
              <span className="text-sm text-[var(--color-emerald-200)]">
                Developer experience launching soon
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
