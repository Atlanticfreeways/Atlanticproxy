import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastContainer } from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AtlanticProxy - Enterprise-Grade Always-On Proxy Platform',
  description: 'Never disconnect. Never fail. Always protected. Enterprise-grade proxy platform with <500ms failover, zero-leak protection, and bulletproof infrastructure.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  )
}