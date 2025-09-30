import React from 'react'
import Link from 'next/link'

interface AdminMobileNavProps {
  navigation: Array<{
    name: string
    href: string
    icon: React.ComponentType<{ className?: string }>
  }>
}

export const AdminMobileNav: React.FC<AdminMobileNavProps> = ({ navigation }) => {
  return (
    <div className="md:hidden bg-card border-b border-border">
      <div className="px-4 pt-2 pb-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
} 