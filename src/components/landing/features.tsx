"use client";

import { Logomark } from "@/components/logo/Logo";
import { FeatureSection } from "./feature-section";
import { NotifyVisual } from "./notify-visual";
import { ReconcileVisual } from "./reconcile-visual";

export function Features() {
  return (
    <div id="features">
      {/* 01 — Collect */}
      <FeatureSection
        index="01"
        headline="Every customer gets their own bank account."
        body="Settle generates a unique Nomba virtual account number for each customer. When they
              transfer money from any bank app, the payment lands in your business account but
              Settle knows exactly who sent it — no more squinting at credit alerts."
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
                <div className="text-[var(--color-sand-50)] text-xl font-semibold" style={{ fontFamily: "var(--font-mono)" }}>&#8358;45,000</div>
              </div>
            </div>
          </div>
        }
      />

      {/* 02 — Reconcile */}
      <FeatureSection
        index="02"
        headline="Automatic reconciliation — no manual work."
        body="Every inbound transfer is instantly matched to the correct customer and payment
              record. Overpaid, underpaid, or exact — Settle flags the difference and updates
              their balance. No end-of-day matching, no cross-referencing statements."
        visual={<ReconcileVisual />}
        flip
      />

      {/* 03 — Notify */}
      <FeatureSection
        index="03"
        headline="Real-time notifications when money arrives."
        body="The moment a payment is confirmed, you get notified in-app and by email. Your
              customer's payment page updates live too — so everyone knows the status without
              asking. No refreshing, no checking the bank app."
        visual={<NotifyVisual />}
      />
    </div>
  );
}
