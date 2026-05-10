import type { Metadata } from "next";
import { Sofia_Sans } from "next/font/google";
import "./globals.css";

const sofia = Sofia_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sofia",
});

export const metadata: Metadata = {
  title: "HireIQ — AI Hiring Platform",
  description:
    "AI-screened candidates, ranked and ready. Post a job, get an editorial-grade hiring pipeline.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={sofia.variable}>
      <body className="bg-canvas text-ink min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
