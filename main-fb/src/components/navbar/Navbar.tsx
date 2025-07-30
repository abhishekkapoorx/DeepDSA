import React from 'react'
import { NavbarBrand } from './NavbarBrand'
import { NavbarNavigation } from './NavbarNavigation'
import { NavbarActions } from './NavbarActions'
import { MobileNav } from './MobileNav'

export interface NavbarProps {
  className?: string
}

export const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  return (
    <nav className={`bg-background border-b border-border/40 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavbarBrand />
          <NavbarNavigation />
          <div className="flex items-center space-x-4">
            <NavbarActions />
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  )
} 