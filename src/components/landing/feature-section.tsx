"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface FeatureProps {
  index: string;
  headline: string;
  body: string;
  visual: React.ReactNode;
  flip?: boolean;
}

export function FeatureSection({ index, headline, body, visual, flip = false }: FeatureProps) {
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
            <h3 className="text-display-md text-[var(--color-heading)] mb-4">
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
