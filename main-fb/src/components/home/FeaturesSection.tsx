"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Code2, 
  Target, 
  TrendingUp, 
  Users2, 
  Zap,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react'

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: "Structured Practice",
      description: "Work through topic-based problem sets with a clear progression from fundamentals to advanced patterns.",
      benefits: ["Topic-oriented learning", "Difficulty progression", "Progress tracking"]
    },
    {
      icon: Code2,
      title: "Built-in Code Workspace",
      description: "Edit, run, and validate solutions in a single problem interface with language switching and test execution.",
      benefits: ["Multi-language support", "Execution results", "Testcase review"]
    },
    {
      icon: Target,
      title: "Editorials & Solutions",
      description: "Review explanations, community solutions, and discussion threads after each attempt.",
      benefits: ["Guided explanations", "Community answers", "Solution comparison"]
    },
    {
      icon: TrendingUp,
      title: "Submission Insights",
      description: "See test outcomes, runtime feedback, and accepted submissions to understand where your solution breaks down.",
      benefits: ["Fail-fast debugging", "Acceptance reports", "Optimization feedback"]
    },
    {
      icon: Users2,
      title: "Community Learning",
      description: "Discuss approaches, share strategies, and learn from other developers solving the same problems.",
      benefits: ["Discussions", "Shared solutions", "Peer feedback"]
    },
    {
      icon: Zap,
      title: "Contests & Interview Prep",
      description: "Train under timed conditions and practice interview-style problem solving alongside regular contests.",
      benefits: ["Timed rounds", "Interview practice", "Competitive workflow"]
    }
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-in fade-in duration-1000">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4 sm:px-0 text-foreground">
            Built for real DSA practice
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
            DeepDSA combines coding problems, execution feedback, editorial explanations, and contest workflows in one place.
          </p>
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
           {features.map((feature, index) => (
             <div
               key={index}
               className="group perspective-1000 animate-in fade-in duration-1000"
               style={{ animationDelay: `${index * 100}ms` }}
             >
               <Card className="h-full border border-border bg-card/95 shadow-sm transition-all duration-300 hover:border-border/80 hover:shadow-md">
                 <CardHeader className="pb-4">
                   <div className="flex items-center justify-between mb-4">
                     <div className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center transition-transform duration-300">
                       <feature.icon className="w-6 h-6 text-foreground" />
                     </div>
                     <Badge variant="secondary" className="text-xs bg-muted text-foreground border border-border">
                       Feature
                     </Badge>
                   </div>
                   <CardTitle className="text-xl mb-2 text-foreground">
                     {feature.title}
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <p className="text-muted-foreground text-sm leading-relaxed">
                     {feature.description}
                   </p>
                   <div className="space-y-2">
                     {feature.benefits.map((benefit, benefitIndex) => (
                       <div
                         key={benefitIndex}
                         className="flex items-center space-x-2 animate-in fade-in duration-500"
                         style={{ animationDelay: `${(index * 100) + (benefitIndex * 50)}ms` }}
                       >
                         <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                         <span className="text-sm text-muted-foreground">{benefit}</span>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             </div>
           ))}
         </div>

         {/* Stats Section */}
         <div className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 animate-in fade-in duration-1000" style={{ animationDelay: '400ms' }}>
           {[
             { icon: Users2, value: "Community", label: "Discussion-driven learning" },
             { icon: Code2, value: "Practice", label: "Problem-first workflow" },
             { icon: Clock, value: "Timed", label: "Contest-ready sessions" },
             { icon: Star, value: "Review", label: "Editorial feedback" }
           ].map((stat, index) => (
             <div
               key={index}
               className="text-center group animate-in fade-in duration-500"
               style={{ animationDelay: `${500 + index * 100}ms` }}
             >
               <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                 <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
               </div>
               <div className="text-2xl sm:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                 {stat.value}
               </div>
               <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
             </div>
           ))}
         </div>
      </div>
    </section>
  )
} 