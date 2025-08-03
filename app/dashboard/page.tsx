'use client'

import { useUser, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Calendar, Plus, CreditCard, Eye, Bell, Sparkles, Clock, Send } from 'lucide-react'

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </main>
    )
  }

  if (!isSignedIn) {
    return null
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Mock data - replace with real data fetching
  const upcomingOccasions = [
    {
      id: 1,
      contactName: "Sarah Johnson",
      date: "Dec 15, 2024",
      occasionType: "Birthday",
      daysUntil: 3
    },
    {
      id: 2,
      contactName: "Mom & Dad",
      date: "Dec 20, 2024",
      occasionType: "Anniversary",
      daysUntil: 8
    },
    {
      id: 3,
      contactName: "Jake Wilson",
      date: "Dec 25, 2024",
      occasionType: "Christmas",
      daysUntil: 13
    }
  ]

  const recentActivities = [
    {
      id: 1,
      message: "Birthday card for Sarah Johnson delivered successfully",
      time: "2 hours ago",
      type: "delivered"
    },
    {
      id: 2,
      message: "Anniversary card for Mom & Dad is being printed",
      time: "1 day ago",
      type: "printing"
    },
    {
      id: 3,
      message: "Christmas template created and saved",
      time: "3 days ago",
      type: "template"
    }
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-card-foreground">Postanos</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 text-sm">
                <span className="text-card-foreground font-medium">
                  {user?.firstName || 'User'}
                </span>
                <span className="text-muted-foreground">
                  {user?.emailAddresses[0]?.emailAddress}
                </span>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "shadow-lg border border-border",
                    userButtonPopoverFooter: "hidden"
                  }
                }}
                afterSignOutUrl="/"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {getGreeting()}, {user?.firstName || 'there'}.
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Here's what's happening with your postcard concierge.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Occasions - Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Occasions
                </h3>
                <button className="text-sm text-primary hover:text-primary/80 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {upcomingOccasions.map((occasion) => (
                  <div key={occasion.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div>
                      <p className="font-medium text-card-foreground">{occasion.contactName}</p>
                      <p className="text-sm text-muted-foreground">{occasion.occasionType}</p>
                      <p className="text-xs text-muted-foreground">{occasion.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-primary">
                        {occasion.daysUntil} days
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingOccasions.length === 0 && (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No upcoming occasions. Add some special dates to get started!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Occasion
                </button>
                <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Create New Card
                </button>
                <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  View All Occasions
                </button>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-200/20 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Inspiration
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Need inspiration? Let AI help you craft the perfect message for Sarah's upcoming birthday.
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Get Message Ideas
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Reminder Summary */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                This Week
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Auto-sends scheduled</span>
                  <span className="text-lg font-semibold text-green-600">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cards in production</span>
                  <span className="text-lg font-semibold text-blue-600">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Delivered this week</span>
                  <span className="text-lg font-semibold text-primary">3</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'delivered' && <Send className="h-4 w-4 text-green-500" />}
                      {activity.type === 'printing' && <Clock className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'template' && <CreditCard className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-card-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No recent activity yet. Start creating occasions and cards!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}