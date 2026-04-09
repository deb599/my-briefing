import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subject Decision Briefing",
  description: "6-Agent AI Pipeline — brutally honest career and subject research",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
