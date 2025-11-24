import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Atlantic Proxy - Enterprise-Grade Always-On Proxy Platform',
  description: 'Never disconnect. Never fail. Always protected. Enterprise-grade proxy service with VPN-level reliability.',
  keywords: 'proxy, VPN, enterprise, always-on, residential proxy, datacenter proxy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}