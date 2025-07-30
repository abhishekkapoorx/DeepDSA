"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const NavbarNavigation: React.FC = () => {
  const pathname = usePathname()

  const navigationItems = [
    { href: '/explore', label: 'Explore' },
    { href: '/problems', label: 'Problems' },
    { href: '/contest', label: 'Contest' },
    { href: '/discuss', label: 'Discuss' },
    { href: '/interview', label: 'Interview' },
    { href: '/store', label: 'Store' },
  ]

  return (
    <div className="hidden md:flex items-center space-x-8">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
} 