import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - Postanos',
  description: 'Sign in or create your Postanos account',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card pointer-events-none" />
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}