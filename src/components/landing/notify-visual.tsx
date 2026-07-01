"use client";

import { motion } from "framer-motion";

const notifications = [
  { time: "Just now",   text: "Emeka Okafor paid ₦45,000 · Unit 12B · Exact",   fresh: true },
  { time: "4 min ago",  text: "Fatima Bello paid ₦45,000 · Unit 14A · Exact",   fresh: false },
  { time: "12 min ago", text: "Chidi Okonkwo paid ₦40,000 · Office 3F · Short ₦80,000", fresh: false },
];

export function NotifyVisual() {
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
              ? "bg-[var(--color-bg-subtle)] border-[var(--color-border-strong)] shadow-[var(--shadow-card)]"
              : "bg-[var(--color-surface-raised)] border-[var(--color-border)]"}
          `}
        >
          <span className={`
            shrink-0 mt-1 w-2 h-2 rounded-full
            ${n.fresh ? "bg-[var(--color-primary)]" : "bg-[var(--color-ink-faint)]"}
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
