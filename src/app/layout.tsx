import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://settle.ng";
const siteName = "Settle";
const siteDescription =
  "Give every customer their own bank account number. Settle matches every transfer, updates their balance, and tells you the moment it lands. No spreadsheet required.";
const socialDescription =
  "One account per customer. Every payment tracked, reconciled, and notified automatically.";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  category: "finance",
  title: {
    default: "Settle - Payment collection for Nigerian SMEs",
    template: "%s · Settle",
  },
  description: siteDescription,
  keywords: [
    "Settle",
    "payments",
    "Nigeria",
    "SME",
    "virtual account",
    "payment collection",
    "bank transfer reconciliation",
    "rent collection",
    "school fees",
    "Nomba",
  ],
  authors: [{ name: siteName, url: siteUrl }],
  creator: siteName,
  publisher: siteName,
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
    languages: {
      "en-NG": "/",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName,
    title: "Settle - Payment collection for Nigerian SMEs",
    description: socialDescription,
    images: [
      {
        url: "/og-square.png",
        width: 512,
        height: 512,
        alt: "Settle - payment collection for Nigerian SMEs",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Settle - Get paid without the spreadsheet",
    description: "One account per customer. Every payment tracked automatically.",
    images: [
      {
        url: "/og-square.png",
        alt: "Settle - payment collection for Nigerian SMEs",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF6EC" },
    { media: "(prefers-color-scheme: dark)", color: "#07130F" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem("settle-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={[fraunces.variable, ibmPlexMono.variable]
        .filter(Boolean)
        .join(" ")}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
