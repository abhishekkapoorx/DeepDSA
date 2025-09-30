import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, Code, Users, BarChart3, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

interface AdminHeaderProps {
  navigation: Array<{
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }>
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ navigation }) => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center">
              <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-3">
                LC
              </div>
              <span className="text-xl font-bold text-foreground">Admin Panel</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-border" />
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Back to Site
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 