import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/providers/ClientProviders'
import MainLayout from '@/components/layout/MainLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BDSEC Mini App',
  description: 'Professional trading app for BDSEC Securities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
      </head>
      <body className={inter.className}>
        <ClientProviders>
          <MainLayout>
            {children}
          </MainLayout>
        </ClientProviders>
      </body>
    </html>
  )
} 