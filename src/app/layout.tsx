import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased scroll-pt-20 md:scroll-pt-0">
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            className: "glass-panel text-slate-800 border border-white/20 shadow-lg",
          }}
        />
      </body>
    </html>
  );
}
