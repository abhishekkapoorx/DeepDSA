"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Sparkles, Rocket, Target } from 'lucide-react'
import Link from 'next/link'
export const CTASection: React.FC = () => {
    return (
        <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-muted/25">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_55%)]" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10 sm:mb-12 lg:mb-16 animate-in fade-in duration-1000">
                        <div className="inline-flex items-center space-x-2 bg-background border border-border px-4 py-2 rounded-full text-sm font-medium mb-4 sm:mb-6 text-foreground shadow-sm">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span>Keep building momentum</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4 sm:px-0 text-foreground">
                            Start solving with DeepDSA
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
                            Move from problem statements to working code, solution review, and contest practice without switching tools.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12 lg:mb-16 animate-in fade-in duration-1000" style={{ animationDelay: '200ms' }}>
                        {[
                            {
                                icon: Rocket,
                                title: "Pick a problem",
                                description: "Start with topic-driven practice and build momentum",
                                color: "from-blue-500 to-cyan-500"
                            },
                            {
                                icon: Target,
                                title: "Run your code",
                                description: "Validate logic against sample and hidden checks",
                                color: "from-green-500 to-emerald-500"
                            },
                            {
                                icon: Sparkles,
                                title: "Review the path",
                                description: "Compare solutions, editorials, and discussion feedback",
                                color: "from-purple-500 to-pink-500"
                            }
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="group animate-in fade-in duration-1000"
                                style={{ animationDelay: `${300 + index * 100}ms` }}
                            >
                                <Card className="h-full border border-border bg-card/95 shadow-sm transition-all duration-300 hover:border-border/80 hover:shadow-md">
                                    <CardContent className="p-4 sm:p-6 text-center">
                                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                            <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
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
                                <Button size="lg" className="group w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-semibold shadow-sm hover:shadow-md transition-all duration-300">
                                    Open the problem set
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/explore">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto min-h-[48px] px-8 py-3 text-base font-semibold border border-border bg-background hover:bg-muted transition-all duration-300">
                                    Explore the library
                                </Button>
                            </Link>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
                            Practice, compete, and improve with a workflow built around actual problem solving.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
} 