import React from 'react'
import Link from 'next/link'

export const NavbarBrand: React.FC = () => {
  return (
    <div className="flex items-center">
      <Link href="/" className="flex items-center space-x-2">
        <span className="text-xl font-bold text-foreground">DeepDSA</span>
      </Link>
    </div>
  )
} 