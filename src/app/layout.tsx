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
    "Supply beyond May is unconfirmed. 98% Middle East dependence. One refinery. No strategic reserve. This dashboard arms Philippine policymakers with live market intelligence, economic scenario modeling, and actionable recommendations to navigate the worst energy crisis since the 1990s.",
  openGraph: {
    title: "Pipedream — Navigating the Philippine Energy Emergency",
    description:
      "Supply beyond May is unconfirmed. 98% Middle East dependence. One refinery. No strategic reserve. Live market data, 10K+ station tracker, and policy recommendations for the UPLIFT Committee, DOE, and DOF.",
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
