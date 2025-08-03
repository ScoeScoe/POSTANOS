import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export default async function HomePage() {
  const { userId } = await auth()
  
  // Redirect signed-in users to dashboard
  if (userId) {
    redirect('/dashboard')
  }
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <div className="w-32 h-32 flex items-center justify-center">
            <img
              src="/POSTANOS Logo.png"
              alt="Postanos Logo"
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Hero Content */}
          <h1 className="text-5xl md:text-6xl font-bold text-foreground max-w-3xl">
            Never Forget an Important Date Again
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            Postanos is your personal postcard concierge. Upload photos, craft messages with AI, 
            and we'll automatically print and mail beautiful postcards to your loved ones.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a href="/sign-up" className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-accent transition-colors shadow-lg">
              Get Started Free
            </a>
            <a href="/sign-in" className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold border-2 border-secondary hover:bg-secondary/80 transition-colors">
              Sign In
            </a>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl">
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Occasion Vault</h3>
              <p className="text-muted-foreground">
                Store birthdays, anniversaries, and special dates. We'll never let you forget.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">AI-Powered Design</h3>
              <p className="text-muted-foreground">
                Create stunning postcards with your photos or AI-generated art and personalized messages.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-xl shadow-lg border border-border">
              <div className="text-4xl mb-4">📮</div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">Automated Delivery</h3>
              <p className="text-muted-foreground">
                Set it and forget it. We print and mail your postcards to arrive right on time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}