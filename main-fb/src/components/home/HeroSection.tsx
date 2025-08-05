"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Code, Trophy, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-6 animate-in fade-in duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              DeepDSA
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Master Data Structures & Algorithms with our interactive platform
            </p>
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
              Practice coding problems, participate in contests, and join a community of passionate developers
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in duration-1000" style={{ animationDelay: '200ms' }}>
            <Link href="/problems">
              <Button size="lg" className="group">
                Start Practicing
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg">
                Explore Problems
              </Button>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 animate-in fade-in duration-1000" style={{ animationDelay: '400ms' }}>
            {[
              {
                icon: Code,
                title: "500+ Problems",
                description: "Curated problems from easy to hard"
              },
              {
                icon: Trophy,
                title: "Daily Contests",
                description: "Compete with developers worldwide"
              },
              {
                icon: Users,
                title: "Active Community",
                description: "Learn and grow together"
              },
              {
                icon: Zap,
                title: "Real-time Execution",
                description: "Test your code instantly"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group animate-in fade-in duration-1000"
                style={{ animationDelay: `${500 + index * 100}ms` }}
              >
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm group-hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
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