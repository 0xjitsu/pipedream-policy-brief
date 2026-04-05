import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Pipedream Policy Brief — Navigating the Energy Emergency",
  description:
    "Interactive policy dashboard for the Philippine fuel crisis. Live oil prices, station tracker, economic scenarios, and actionable recommendations for UPLIFT Committee, DOE, and DOF.",
  openGraph: {
    title: "Pipedream Policy Brief — Philippine Energy Crisis Dashboard",
    description:
      "Live oil prices, 10K+ station tracker, economic scenarios, and policy recommendations.",
    type: "website",
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pipedream Policy Brief — Philippine Energy Crisis",
    description:
      "Interactive policy dashboard with live market data, station tracking, and economic modeling.",
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
