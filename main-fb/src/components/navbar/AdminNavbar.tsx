"use client"
import React from 'react'
import { NavbarBrand } from './NavbarBrand'
import { AdminNavbarNavigation } from './AdminNavbarNavigation'
import { AdminNavbarActions } from './AdminNavbarActions'
import { AdminMobileNav } from './AdminMobileNav'

export interface AdminNavbarProps {
  className?: string
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ className = "" }) => {
  return (
    <nav className={`bg-background border-b border-border/40 ${className}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavbarBrand />
          <AdminNavbarNavigation />
          <div className="flex items-center space-x-4">
            <AdminNavbarActions />
            <AdminMobileNav />
          </div>
        </div>
      </div>
    </nav>
  )
} 