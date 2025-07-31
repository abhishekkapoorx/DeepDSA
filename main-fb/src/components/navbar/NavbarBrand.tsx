"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/components/theme/ThemeProvider'

export const NavbarBrand: React.FC = () => {
  const { theme } = useTheme()
  
  // Choose logo based on theme
  const logoSrc = theme === 'dark' 
    ? '/SVG/DEEPDSA_DARK.svg' 
    : '/SVG/DEEPDSA_LIGHT.svg'
  
  const shortLogoSrc = theme === 'dark'
    ? '/SVG/LOGO_TRANS_DARK.svg'
    : '/SVG/LOGO_TRANS_LIGHT.svg'

  return (
    <div className="flex items-center">
      <Link href="/" className="flex items-center space-x-2">
        {/* Full logo - hidden on mobile */}
        <div className="hidden sm:block">
          <Image
            src={logoSrc}
            alt="DeepDSA Logo"
            width={100}
            height={32}
            className="h-6 w-auto"
            priority
          />
        </div>
        
        {/* Short logo - visible on mobile */}
        <div className="sm:hidden">
          <Image
            src={shortLogoSrc}
            alt="DeepDSA"
            width={32}
            height={32}
            className="h-4 w-auto"
            priority
          />
        </div>
      </Link>
    </div>
  )
} 