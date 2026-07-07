"use client";

import { useState } from "react";

type CopyButtonProps = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  className = "btn-ghost min-h-0 text-sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button type="button" onClick={onCopy} className={className}>
      {copied ? copiedLabel : label}
    </button>
  );
}
