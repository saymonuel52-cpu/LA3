import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@/styles/global.css'
import '@/styles/typography.css'
import '@/styles/utilities.css'
import { AppProvider } from '@/providers/app-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'LAD 2 - Personal Operating System',
  description: 'Local Adaptive Dashboard - Your personal operating system',
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning className="scroll-smooth">
      <head>
        {/* Preload Inter font for better performance */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          as="style"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider>
            <AppProvider>
              <div className="min-h-screen bg-[var(--bg-primary)]">
                {children}
              </div>
            </AppProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}