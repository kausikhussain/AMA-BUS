import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "../components/layout/theme-script";
import { Toaster } from "sonner";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "AmaRide",
  description: "Real-time mobility, ticketing, and route planning for public transport."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable}`}>
        <ThemeScript />
        {children}
        <Toaster theme="system" richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
