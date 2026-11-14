import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Mono, Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";

// Atkinson Hyperlegible was drawn for legibility; the Mono sets hosts and timers, which are data.
const ui = Atkinson_Hyperlegible_Next({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const data = Atkinson_Hyperlegible_Mono({ subsets: ["latin"], variable: "--font-data", display: "swap" });

export const metadata: Metadata = {
  title: "Animal Advocacy Research",
  description:
    "Ask a question about animal advocacy and get a brief in which every line cites the web page it came from.",
};

export const viewport: Viewport = {
  themeColor: "#25362c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ui.variable} ${data.variable}`}>
      <body>{children}</body>
    </html>
  );
}
