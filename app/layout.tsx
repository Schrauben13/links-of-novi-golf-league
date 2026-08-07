import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import TopNav from "@/components/top-nav";
import BottomNav from "@/components/bottom-nav";
import MobileTopBar from "@/components/mobile-top-bar";
import AccountLink from "@/components/account-link";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Links of Novi Golf League",
  description: "Men's golf league at Links of Novi, Novi, MI",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TopNav accountSlot={<AccountLink />} />
        <MobileTopBar />
        <main className="mx-auto min-h-[calc(100dvh-4rem)] max-w-5xl px-4 pb-20 pt-6 md:pb-10">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
