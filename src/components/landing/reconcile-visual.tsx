"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const items = [
  { raw: "TRF/0123/EMEKA OKAFOR", resolved: "Emeka Okafor — Unit 12B — Paid in full", ok: true },
  { raw: "TRF/0456/FAT BELLO",    resolved: "Fatima Bello — Unit 14A — Paid in full", ok: true },
  { raw: "TRF/0789/UNKNOWN",      resolved: "Unknown — needs review",                 ok: false },
];

export function ReconcileVisual() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="
        w-full max-w-sm mx-auto rounded-[var(--radius-card)]
        border border-[var(--color-border)] bg-[var(--color-surface-raised)]
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
                  ? "bg-[var(--color-bg-subtle)] text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
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
              ${flipped ? "bg-[var(--color-bg-subtle)]" : "bg-transparent"}
            `}
          >
            {/* Icon */}
            <span className={`
              mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center
              ${flipped && item.ok
                ? "bg-[var(--color-emerald-100)]"
                : flipped
                  ? "bg-[var(--color-clay-100)]"
                  : "bg-[var(--color-bg-subtle)]"}
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
                  ? item.ok ? "text-[var(--color-ink)]" : "text-[var(--color-accent)]"
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
