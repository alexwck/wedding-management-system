import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GradientBackdrop } from "@/components/gradient-backdrop";
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
  title: "Wedding RSVP",
  description: "Wedding RSVP management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-pt-20 md:scroll-pt-0`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <GradientBackdrop />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
