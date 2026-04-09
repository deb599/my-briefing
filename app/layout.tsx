import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Subject Decision Briefing",
  description: "5-Agent Pipeline Output",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
