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
      title: "Smart Learning Path",
      description: "AI-powered recommendations based on your progress and skill level",
      benefits: ["Personalized curriculum", "Adaptive difficulty", "Progress tracking"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Code2,
      title: "Interactive Code Editor",
      description: "Real-time code execution with syntax highlighting and debugging tools",
      benefits: ["Multiple languages", "Live preview", "Error detection"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Target,
      title: "Problem Categories",
      description: "Organized problems by topics, difficulty, and company tags",
      benefits: ["Topic-wise practice", "Company-specific", "Difficulty levels"],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Detailed insights into your coding performance and improvement areas",
      benefits: ["Time analysis", "Success rate", "Skill gaps"],
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users2,
      title: "Community Features",
      description: "Connect with fellow developers, share solutions, and learn together",
      benefits: ["Discussion forums", "Solution sharing", "Peer learning"],
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Zap,
      title: "Contest Mode",
      description: "Participate in timed contests and compete with developers worldwide",
      benefits: ["Timed challenges", "Leaderboards", "Real-time ranking"],
      color: "from-yellow-500 to-orange-500"
    }
  ]

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-in fade-in duration-1000">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4 sm:px-0">
            Why Choose <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">DeepDSA</span>?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
            Experience the most comprehensive platform for mastering Data Structures & Algorithms
          </p>
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
           {features.map((feature, index) => (
             <div
               key={index}
               className="group perspective-1000 animate-in fade-in duration-1000"
               style={{ animationDelay: `${index * 100}ms` }}
             >
               <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm group-hover:border-primary/50 transition-all duration-500 transform-gpu card-enhanced">
                 <CardHeader className="pb-4">
                   <div className="flex items-center justify-between mb-4">
                     <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                       <feature.icon className="w-6 h-6 text-white" />
                     </div>
                     <Badge variant="secondary" className="text-xs">
                       Feature
                     </Badge>
                   </div>
                   <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
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
             { icon: Users2, value: "50K+", label: "Active Users" },
             { icon: Code2, value: "500+", label: "Problems" },
             { icon: Clock, value: "24/7", label: "Available" },
             { icon: Star, value: "4.9", label: "Rating" }
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