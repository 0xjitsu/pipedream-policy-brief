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
  title: "Pipedream Policy Brief — Navigating the Energy Emergency",
  description:
    "Live policy dashboard for the Philippine fuel crisis — supply analysis, economic scenarios, 10K+ station tracker, and recommendations for DOE, DOF, and UPLIFT.",
  openGraph: {
    title: "Pipedream — Navigating the Philippine Energy Emergency",
    description:
      "Supply beyond May is unconfirmed. Live market data, 10K+ station tracker, and policy recommendations for Philippine decision-makers.",
    type: "website",
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pipedream — Navigating the Philippine Energy Emergency",
    description:
      "Supply beyond May is unconfirmed. 98% Middle East dependence. One refinery. No strategic reserve. Live intelligence and policy recommendations for Philippine decision-makers.",
  },
  robots: {
    index: true,
    follow: true,
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
