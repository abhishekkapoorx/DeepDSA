"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles, Rocket, Target } from 'lucide-react'
import Link from 'next/link'
export const CTASection: React.FC = () => {
    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5" />
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/2 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12 animate-in fade-in duration-1000">
                        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Ready to Level Up?</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Start Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Coding Journey</span> Today
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Join thousands of developers who are already mastering DSA with DeepDSA
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in duration-1000" style={{ animationDelay: '200ms' }}>
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
                                <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm group-hover:border-primary/50 transition-all duration-300">
                                    <CardContent className="p-6 text-center">
                                        <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    <div className="text-center space-y-6 animate-in fade-in duration-1000" style={{ animationDelay: '400ms' }}>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/problems">
                                <Button size="lg" className="group bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/explore">
                                <Button variant="outline" size="lg">
                                    Browse Problems
                                </Button>
                            </Link>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            No credit card required • Free forever • Join 50,000+ developers
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
} 