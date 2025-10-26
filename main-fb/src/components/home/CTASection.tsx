"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles, Rocket, Target } from 'lucide-react'
import Link from 'next/link'
export const CTASection: React.FC = () => {
    return (
        <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5" />
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/2 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10 sm:mb-12 lg:mb-16 animate-in fade-in duration-1000">
                        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4 sm:mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Ready to Level Up?</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">
                            Start Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Coding Journey</span> Today
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
                            Join thousands of developers who are already mastering DSA with DeepDSA
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12 lg:mb-16 animate-in fade-in duration-1000" style={{ animationDelay: '200ms' }}>
                        {[
                            {
                                icon: Rocket,
                                title: "Quick Start",
                                description: "Begin with curated beginner problems",
                                color: "from-blue-500 to-cyan-500"
                            },
                            {
                                icon: Target,
                                title: "Track Progress",
                                description: "Monitor your improvement over time",
                                color: "from-green-500 to-emerald-500"
                            },
                            {
                                icon: Sparkles,
                                title: "Earn Achievements",
                                description: "Unlock badges and certificates",
                                color: "from-purple-500 to-pink-500"
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="group animate-in fade-in duration-1000"
                                style={{ animationDelay: `${300 + index * 100}ms` }}
                            >
                                <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm group-hover:border-primary/50 transition-all duration-300 card-enhanced">
                                    <CardContent className="p-4 sm:p-6 text-center">
                                        <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                        <h3 className="text-base sm:text-lg font-semibold mb-2">{item.title}</h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    <div className="text-center space-y-4 sm:space-y-6 animate-in fade-in duration-1000" style={{ animationDelay: '400ms' }}>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 sm:px-0">
                            <Link href="/problems">
                                <Button size="lg" className="group bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/explore">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-semibold border-2 hover:border-primary/50 transition-all duration-300">
                                    Browse Problems
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
                            No credit card required • Free forever • Join 50,000+ developers
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
} 