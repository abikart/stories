import type { Metadata } from "next";
import { Inter, Lexend, Quicksand } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand" });
const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" });

export const metadata: Metadata = {
  title: "stories.sh — interactive story films",
  description:
    "Expressive illustrated stories that wait for children and let them help the story happen.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${quicksand.variable} ${lexend.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
