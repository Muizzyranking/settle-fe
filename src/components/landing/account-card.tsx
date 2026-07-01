"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useReducer, useRef } from "react";
import { Logomark } from "@/components/logo/Logo";

const PAYMENTS = [
  { name: "Emeka Okafor",  ref: "Unit 12B",   amount: 45000,  currency: "₦" },
  { name: "Fatima Bello",  ref: "Unit 14A",   amount: 45000,  currency: "₦" },
  { name: "Chidi Okonkwo", ref: "Office 3F",  amount: 120000, currency: "₦" },
];

type State = {
  paymentIndex: number;
  showToast: boolean;
  balance: number;
  pulseKey: number;
};

type Action =
  | { type: "SHOW_TOAST" }
  | { type: "UPDATE_BALANCE"; amount: number }
  | { type: "HIDE_TOAST" }
  | { type: "NEXT_PAYMENT" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SHOW_TOAST":    return { ...state, showToast: true, pulseKey: state.pulseKey + 1 };
    case "UPDATE_BALANCE": return { ...state, balance: state.balance + action.amount };
    case "HIDE_TOAST":    return { ...state, showToast: false };
    case "NEXT_PAYMENT":  return { ...state, paymentIndex: (state.paymentIndex + 1) % PAYMENTS.length };
    default:              return state;
  }
}

function formatAmount(n: number) {
  return n.toLocaleString("en-NG");
}

interface AccountCardProps {
  className?: string;
}

export function AccountCard({ className = "" }: AccountCardProps) {
  const prefersReduced = useReducedMotion();

  const [state, dispatch] = useReducer(reducer, {
    paymentIndex: 0,
    showToast: false,
    balance: 0,
    pulseKey: 0,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => { if (timerRef.current) clearTimeout(timerRef.current); };
  const delay = (ms: number) => new Promise<void>((r) => { timerRef.current = setTimeout(r, ms); });

  useEffect(() => {
    if (prefersReduced) {
      /* Static state — just show a settled balance, no animation */
      dispatch({ type: "UPDATE_BALANCE", amount: 45000 });
      return;
    }

    let active = true;

    async function cycle() {
      while (active) {
        await delay(1800);
        if (!active) break;

        dispatch({ type: "SHOW_TOAST" });
        await delay(1400);
        if (!active) break;

        const payment = PAYMENTS[state.paymentIndex];
        dispatch({ type: "UPDATE_BALANCE", amount: payment.amount });
        await delay(900);
        if (!active) break;

        dispatch({ type: "HIDE_TOAST" });
        await delay(800);
        if (!active) break;

        dispatch({ type: "NEXT_PAYMENT" });
        await delay(2200);
      }
    }

    cycle();
    return () => { active = false; clear(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.paymentIndex, prefersReduced]);

  const currentPayment = PAYMENTS[state.paymentIndex];

  return (
    <div className={`relative select-none ${className}`} aria-hidden="true">

      {/* Pulse ring — emits on each payment */}
      <AnimatePresence>
        {state.showToast && (
          <motion.div
            key={state.pulseKey}
            initial={{ scale: 0.9, opacity: 0.6 }}
            animate={{ scale: 1.18, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="
              absolute inset-0 rounded-[1.35rem] pointer-events-none
              border-2 border-[var(--color-emerald-400)]
            "
          />
        )}
      </AnimatePresence>

      {/* Card body */}
      <div className="account-card w-full max-w-[19rem] mx-auto" style={{ minHeight: 196 }}>

        {/* Card header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[var(--color-sand-200)] text-[11px] font-medium tracking-widest uppercase mb-0.5">
              Settle
            </div>
            <div className="text-[var(--color-sand-50)] font-semibold text-sm leading-tight">
              Sunshine Estates
            </div>
          </div>
          <Logomark scheme="dark" size={32} aria-hidden />
        </div>

        {/* Account number */}
        <div className="mb-5">
          <div className="text-[var(--color-sand-200)] text-[10px] tracking-widest uppercase mb-1">
            Account number
          </div>
          <div
            className="text-[var(--color-sand-50)] tracking-[0.18em] text-base"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            9171 4245 34
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[var(--color-sand-200)] text-[10px] tracking-widest uppercase mb-1">
              Total received
            </div>
            <motion.div
              key={state.balance}
              initial={prefersReduced ? false : { y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="text-[var(--color-sand-50)] text-2xl font-semibold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ₦{formatAmount(state.balance)}
            </motion.div>
          </div>

          {/* Status dot */}
          <motion.div
            animate={state.showToast
              ? { backgroundColor: "#3DA07C", scale: 1.15 }
              : { backgroundColor: "#6DC0A2", scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-2.5 h-2.5 rounded-full mb-1"
          />
        </div>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {state.showToast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, x: 32, y: -4 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 16, y: -4 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="
              absolute -top-4 -right-4
              flex items-center gap-2.5 px-3.5 py-2.5
              bg-[var(--color-bg)] rounded-[var(--radius-card)]
              shadow-[var(--shadow-float)]
              border border-[var(--color-border)]
              max-w-[13rem]
            "
          >
            {/* Green dot */}
            <span className="shrink-0 w-2 h-2 rounded-full bg-[var(--color-emerald-400)]" />

            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-[var(--color-ink)] truncate leading-tight">
                {currentPayment.currency}{formatAmount(currentPayment.amount)} received
              </div>
              <div className="text-[10px] text-[var(--color-ink-muted)] truncate leading-tight mt-0.5">
                {currentPayment.name} · {currentPayment.ref}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
