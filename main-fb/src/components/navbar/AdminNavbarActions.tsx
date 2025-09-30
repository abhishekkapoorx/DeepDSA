import React from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme'
import {
  SignedIn,
  UserButton,
} from '@clerk/nextjs'
import Link from 'next/link'

export const AdminNavbarActions: React.FC = () => {
  return (
    <div className="flex items-center space-x-4">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Back to Main Site */}
      <Link href="/">
        <Button 
          variant="outline" 
          size="sm"
        >
          Back to Site
        </Button>
      </Link>

      {/* Auth User */}
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  )
} 