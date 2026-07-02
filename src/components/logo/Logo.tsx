"use client";


type LogoVariant = "full" | "mark";
type LogoScheme = "light" | "dark" | "auto";

interface LogoProps {
  variant?: LogoVariant;
  scheme?: LogoScheme;
  size?: number; // height in px — width scales proportionally
  className?: string;
  "aria-hidden"?: boolean;
}

function Logomark({ scheme = "light", size = 32, className, ...rest }: Omit<LogoProps, "variant">) {
  const fill = scheme === "auto" ? "var(--color-primary)" : scheme === "light" ? "#1F6F54" : "#FAF6EC";
  const backFill = scheme === "auto"
    ? "var(--color-bg-subtle)"
    : scheme === "light"
      ? "#D4E9DF"
      : "rgba(250,246,236,0.20)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={rest["aria-hidden"] ? undefined : "img"}
      aria-label={rest["aria-hidden"] ? undefined : "Settle"}
      className={className}
      aria-hidden={rest["aria-hidden"]}
    >
      <rect x="4" y="8" width="38" height="38" rx="9" fill={backFill} />

      <path
        d="M22,18 H50 A10,10 0 0 1 60,28 V56 A10,10 0 0 1 50,66 H22 A10,10 0 0 1 12,56 V28 A10,10 0 0 1 22,18 Z
           M52,22 A5,5 0 1 0 52,32 A5,5 0 1 0 52,22 Z"
        fillRule="evenodd"
        fill={fill}
      />
    </svg>
  );
}

function LogoFull({ scheme = "light", size = 32, className }: Omit<LogoProps, "variant">) {
  const textFill = scheme === "auto" ? "var(--color-heading)" : scheme === "light" ? "#0E3B2E" : "#FAF6EC";
  const markBackFill = scheme === "auto"
    ? "var(--color-bg-subtle)"
    : scheme === "light"
      ? "#D4E9DF"
      : "rgba(250,246,236,0.20)";
  const markFill = scheme === "auto" ? "var(--color-primary)" : scheme === "light" ? "#1F6F54" : "#FAF6EC";

  const width = Math.round(size * 6.75);

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 216 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Settle"
      className={className}
    >
      <g transform="translate(-4,-5) scale(0.875)">
        <rect x="4" y="8" width="38" height="38" rx="9" fill={markBackFill} />
        <path
          d="M22,18 H50 A10,10 0 0 1 60,28 V56 A10,10 0 0 1 50,66 H22 A10,10 0 0 1 12,56 V28 A10,10 0 0 1 22,18 Z
             M52,22 A5,5 0 1 0 52,32 A5,5 0 1 0 52,22 Z"
          fillRule="evenodd"
          fill={markFill}
        />
      </g>

      <text
        x="62"
        y="38"
        fontFamily="Fraunces, 'Iowan Old Style', Georgia, serif"
        fontSize="32"
        fontWeight="480"
        letterSpacing="-0.5"
        fill={textFill}
      >
        Settle
      </text>
    </svg>
  );
}

export function Logo({ variant = "full", scheme = "light", size = 32, className, ...rest }: LogoProps) {
  if (variant === "mark") {
    return <Logomark scheme={scheme} size={size} className={className} {...rest} />;
  }
  return <LogoFull scheme={scheme} size={size} className={className} />;
}

export { Logomark };
export default Logo;
