import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pompa WM App | Neo-Brutalism Dashboard",
  description:
    "Pompa WM App — Aplikasi monitoring pompa Water Management dengan gaya Neo-Brutalism yang modern, bold, dan fungsional.",
  keywords: [
    "pompa",
    "water management",
    "dashboard",
    "neo-brutalism",
    "monitoring",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "Pompa WM App | Neo-Brutalism Dashboard",
    description:
      "Aplikasi monitoring pompa Water Management dengan gaya Neo-Brutalism.",
    siteName: "Pompa WM App",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
