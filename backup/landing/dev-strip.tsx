"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Reveal } from "./reveal";

const CODE = {
  curl: `curl -X POST https://api.settle.ng/v1/accounts \
  -H "X-Settle-Key: sk_live_a1b2..." \
  -H "Content-Type: application/json" \
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
// -> "9171424534"`,

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
# -> "9171424534"`,
};

type Lang = keyof typeof CODE;

export function DevStrip() {
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
