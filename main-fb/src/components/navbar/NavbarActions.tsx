import React from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export const NavbarActions: React.FC = () => {
  

  return (
    <div className="flex items-center space-x-4">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Auth Buttons */}
      <SignedOut>
        <SignInButton>
          <Button 
            variant="ghost" 
            size="sm"
          >
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button 
            size="sm"
            variant='secondary'
          >
            Sign Up
          </Button>
        </SignUpButton>
      </SignedOut>
      
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  )
}