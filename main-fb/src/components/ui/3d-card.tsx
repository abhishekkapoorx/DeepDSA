"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Card3DProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  title?: string
}

export const Card3D: React.FC<Card3DProps> = ({ 
  children, 
  className, 
  header, 
  title 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn(
        "perspective-1000 transform-gpu transition-all duration-500",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered 
          ? 'rotateY(5deg) rotateX(2deg) translateZ(20px)' 
          : 'rotateY(0deg) rotateX(0deg) translateZ(0px)'
      }}
    >
      <Card className={cn(
        "h-full border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-500",
        isHovered && "border-primary/50 shadow-2xl shadow-primary/20"
      )}>
        {header && <CardHeader>{header}</CardHeader>}
        {title && <CardTitle>{title}</CardTitle>}
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}