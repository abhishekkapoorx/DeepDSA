"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Code, Trophy, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-16 left-10 h-56 w-56 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-muted/60 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
        <div className="text-center space-y-8 py-12 sm:py-16 lg:py-20">
          {/* Main Heading */}
          <div className="space-y-6 animate-in fade-in duration-1000">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              DeepDSA
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
              Practice, debug, and compete in one DSA workspace built for real problem solving.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto px-4 sm:px-0">
              Work through problem statements, run code in the editor, review editorials, and track your progress across contests and interview prep.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in duration-1000 px-4 sm:px-0" style={{ animationDelay: '200ms' }}>
            <Link href="/problems">
              <Button size="lg" className="group w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                Start Solving
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-semibold border-2 hover:border-primary/50 transition-all duration-300">
                Browse Problems
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16 lg:mt-20 px-4 sm:px-0 animate-in fade-in duration-1000" style={{ animationDelay: '400ms' }}>
            {[
              {
                icon: Code,
                title: "Problem Library",
                description: "Structured practice from fundamentals to advanced topics"
              },
              {
                icon: Trophy,
                title: "Contest Flow",
                description: "Timed rounds, rankings, and performance tracking"
              },
              {
                icon: Users,
                title: "Discussion & Solutions",
                description: "Learn from community explanations and curated answers"
              },
              {
                icon: Zap,
                title: "Run & Submit",
                description: "Execute code against real test cases in the platform"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group animate-in fade-in duration-1000"
                style={{ animationDelay: `${500 + index * 100}ms` }}
              >
                <Card className="h-full border border-border bg-card/95 shadow-sm transition-all duration-300 hover:border-border/80 hover:shadow-md">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-border">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 