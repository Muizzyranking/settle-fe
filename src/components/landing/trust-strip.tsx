"use client";

export function TrustStrip() {
  return (
    <section
      aria-label="Product highlights"
      className="border-y border-[var(--color-border)] bg-[var(--color-bg-subtle)] py-5"
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
  );
}
