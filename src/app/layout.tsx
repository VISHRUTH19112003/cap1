import type { Metadata } from 'next'
import { AppProviders } from '@/components/app-providers'
import { cn } from '@/lib/utils'
import './globals.css'

export const metadata: Metadata = {
  title: 'NyayaGPT',
  description: 'AI-Powered Legal Assistance for Indian Law',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&family=Source+Code+Pro&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
