import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Overview — Explore anywhere. Understand everything.",
  description: "Discover verified stays and experiences across India's hill stations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-white text-stone-900 selection:bg-emerald-200/50">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
