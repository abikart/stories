import type { Metadata } from "next";
import { Inter, Lexend, Quicksand } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand" });
const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" });

export const metadata: Metadata = {
  title: "stories.sh — stories you can touch",
  description:
    "Living storybooks for kids learning to read. Slide under the words to wake the world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${quicksand.variable} ${lexend.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
