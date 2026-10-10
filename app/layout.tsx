import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClassMate Plus — Classroom Studio",
  description: "A clearer classroom workspace for learning, progress, seating, and communication. Expanded hackathon demo.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
