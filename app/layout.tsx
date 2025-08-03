import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Postanos - Automated Postcard Concierge',
  description: 'Never forget an important date again. Postanos automatically sends personalized postcards to your loved ones.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-background text-foreground`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}