import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Briefing — AI Career Intelligence",
  description: "6 specialised AI agents give you the full picture on your next career move. Honest analysis, no hype, under 2 minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
