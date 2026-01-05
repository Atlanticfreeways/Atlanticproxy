import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | AtlanticProxy',
    default: 'AtlanticProxy - Enterprise Residential Network',
  },
  description: 'Manage your high-performance residential proxies with enterprise-grade security and control.',
  keywords: ['proxy', 'residential proxy', 'vpn', 'security', 'atlanticproxy'],
  authors: [{ name: 'AtlanticProxy Team' }],
  openGraph: {
    title: 'AtlanticProxy Dashboard',
    description: 'Enterprise Residential Proxy Network Control Center',
    siteName: 'AtlanticProxy',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
