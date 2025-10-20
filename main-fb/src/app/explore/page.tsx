"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Clock, Users, TrendingUp, BookOpen, Target, Zap } from 'lucide-react'
import Link from 'next/link'

interface Problem {
  _id: string
  title: string
  slug: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  tags: string[]
  companyTags?: string[]
  questionNumber: number
  createdAt: string
}

interface Collection {
  id: string
  name: string
  description: string
  problems: Problem[]
  difficulty: string
  estimatedTime: string
  icon: React.ComponentType<any>
  color: string
}

const ExplorePage = () => {
  const [problems, setProblems] = useState<Problem[]>([])
  const [trendingTags, setTrendingTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/problems?limit=100')
      const data = await response.json()
      
      if (data.problems) {
        setProblems(data.problems)
        
        // Calculate trending tags based on frequency
        const tagCounts: { [key: string]: number } = {}
        data.problems.forEach((problem: Problem) => {
          problem.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        })
        
        const sortedTags = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([tag]) => tag)
        
        setTrendingTags(sortedTags)
      }
    } catch (err) {
      setError('Failed to fetch problems')
      console.error('Error fetching problems:', err)
    } finally {
      setLoading(false)
    }
  }

  const createCollections = (): Collection[] => {
    const collections: Collection[] = [
      {
        id: 'beginner',
        name: 'Beginner Friendly',
        description: 'Start your coding journey with these easy problems',
        problems: problems.filter(p => p.difficulty === 'EASY').slice(0, 10),
        difficulty: 'Easy',
        estimatedTime: '2-3 hours',
        icon: BookOpen,
        color: 'from-green-500 to-emerald-500'
      },
      {
        id: 'arrays',
        name: 'Array Mastery',
        description: 'Master fundamental array operations and algorithms',
        problems: problems.filter(p => p.tags.includes('Array')).slice(0, 12),
        difficulty: 'Mixed',
        estimatedTime: '3-4 hours',
        icon: Target,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        id: 'dynamic-programming',
        name: 'Dynamic Programming',
        description: 'Learn the art of breaking down complex problems',
        problems: problems.filter(p => p.tags.some(tag => tag.includes('DP') || tag.includes('Dynamic'))).slice(0, 8),
        difficulty: 'Medium-Hard',
        estimatedTime: '4-5 hours',
        icon: Zap,
        color: 'from-purple-500 to-pink-500'
      },
      {
        id: 'graph-algorithms',
        name: 'Graph Algorithms',
        description: 'Explore the world of nodes, edges, and connections',
        problems: problems.filter(p => p.tags.some(tag => tag.includes('Graph') || tag.includes('Tree'))).slice(0, 10),
        difficulty: 'Medium-Hard',
        estimatedTime: '3-4 hours',
        icon: TrendingUp,
        color: 'from-orange-500 to-red-500'
      },
      {
        id: 'two-pointers',
        name: 'Two Pointers',
        description: 'Efficient algorithms using two moving pointers',
        problems: problems.filter(p => p.tags.includes('Two Pointers')).slice(0, 8),
        difficulty: 'Easy-Medium',
        estimatedTime: '2-3 hours',
        icon: Clock,
        color: 'from-indigo-500 to-purple-500'
      },
      {
        id: 'company-prep',
        name: 'Company Preparation',
        description: 'Problems frequently asked in tech interviews',
        problems: problems.filter(p => p.companyTags && Array.isArray(p.companyTags) && p.companyTags.length > 0).slice(0, 15),
        difficulty: 'Mixed',
        estimatedTime: '5-6 hours',
        icon: Users,
        color: 'from-yellow-500 to-orange-500'
      }
    ]

    return collections.filter(collection => collection.problems.length > 0)
  }

  const filteredCollections = createCollections().filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Content</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchProblems}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="">Collections</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover curated tracks, topics, and hand-picked problem sets to accelerate your learning journey.
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </header>

        {/* Collections Grid */}
        <section className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredCollections.map((collection) => {
              const IconComponent = collection.icon
              return (
                <Link key={collection.id} href={`/problems?collection=${collection.id}`}>
                  <Card className="group h-full border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 card-enhanced cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${collection.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {collection.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {collection.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {collection.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{collection.problems.length} problems</span>
                        <span>•</span>
                        <span>{collection.estimatedTime}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {collection.problems.slice(0, 3).map((problem, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {problem.difficulty}
                          </Badge>
                        ))}
                        {collection.problems.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{collection.problems.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Trending Topics */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Trending Topics
            </h2>
            <p className="text-muted-foreground">
              Explore the most popular problem categories
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {trendingTags.map((tag, index) => (
              <Link key={tag} href={`/problems?tags=${tag}`}>
                <Badge 
                  variant="outline" 
                  className="px-4 py-2 text-sm rounded-full bg-muted/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                >
                  {tag}
                  <span className="ml-2 text-xs text-muted-foreground group-hover:text-primary">
                    ({problems.filter(p => p.tags.includes(tag)).length})
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mt-16 sm:mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { label: 'Total Problems', value: problems.length, icon: BookOpen },
              { label: 'Topics Covered', value: trendingTags.length, icon: Target },
              { label: 'Difficulty Levels', value: 3, icon: TrendingUp },
              { label: 'Companies', value: new Set(problems.flatMap(p => p.companyTags || [])).size, icon: Users }
            ].map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center group">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ExplorePage