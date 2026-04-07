import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F1B2D",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pipedream-policy-brief.vercel.app"),
  title: "Pipedream Policy Brief — The Philippines Has 45 Days of Fuel Left",
  description:
    "Live policy dashboard for the Philippine fuel crisis: supply countdown, economic scenarios, 10K+ station tracker, and recommendations for DOE, DOF, and UPLIFT.",
  keywords: [
    "Philippine energy crisis",
    "fuel supply",
    "oil prices Philippines",
    "DOE Philippines",
    "fuel subsidy",
    "PriceLOCQ",
    "strategic petroleum reserve",
    "UPLIFT",
    "Brent crude",
    "policy brief",
    "fuel station tracker",
    "Middle East oil dependence",
  ],
  alternates: {
    canonical: "https://pipedream-policy-brief.vercel.app",
  },
  openGraph: {
    title: "The Philippines Has 45 Days of Fuel Left — Pipedream Policy Brief",
    description:
      "Supply beyond May is unconfirmed. Live market data, 10K+ station tracker, and policy recommendations for Philippine decision-makers.",
    type: "website",
    locale: "en_PH",
    url: "https://pipedream-policy-brief.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Philippines Has 45 Days of Fuel Left — Pipedream Policy Brief",
    description:
      "98% Middle East dependence. One refinery. No strategic reserve. Live intelligence and policy recommendations for Philippine decision-makers.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://basemaps.cartocdn.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://query1.finance.yahoo.com" />
        <link rel="dns-prefetch" href="https://api.frankfurter.dev" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
