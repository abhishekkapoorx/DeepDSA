'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Users, Code, BarChart3, Calendar, Target, Award, Clock } from 'lucide-react'

interface Analytics {
  overview: {
    totalProblems: number
    totalUsers: number
    totalTestCases: number
    weeklyGrowth: number
    monthlyGrowth: number
  }
  difficulty: {
    EASY: number
    MEDIUM: number
    HARD: number
  }
  recent: {
    problems: Array<{
      id: string
      title: string
      difficulty: string
      createdAt: string
    }>
    users: Array<{
      id: string
      firstName: string
      lastName: string
      email: string
      createdAt: string
    }>
  }
  trends: {
    problemsThisWeek: number
    problemsThisMonth: number
  }
  popularTags: Array<{
    name: string
    count: number
  }>
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics')
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Problems',
      value: analytics?.overview.totalProblems || 0,
      change: `+${analytics?.trends.problemsThisMonth || 0} this month`,
      icon: Code,
      color: 'text-blue-500'
    },
    {
      title: 'Total Users',
      value: analytics?.overview.totalUsers || 0,
      change: 'Growing community',
      icon: Users,
      color: 'text-green-500'
    },
    {
      title: 'Test Coverage',
      value: analytics?.overview.totalTestCases || 0,
      change: 'Quality assured',
      icon: Target,
      color: 'text-purple-500'
    },
    {
      title: 'This Week',
      value: analytics?.trends.problemsThisWeek || 0,
      change: 'New problems',
      icon: TrendingUp,
      color: 'text-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground mt-2">Platform insights and performance metrics</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <div key={index} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${metric.color}`} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Problem Difficulty Distribution */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Problem Difficulty Distribution
            </h3>
            <div className="space-y-4">
              {[
                { difficulty: 'EASY', count: analytics?.difficulty.EASY || 0, color: 'bg-green-500', percentage: 0 },
                { difficulty: 'MEDIUM', count: analytics?.difficulty.MEDIUM || 0, color: 'bg-yellow-500', percentage: 0 },
                { difficulty: 'HARD', count: analytics?.difficulty.HARD || 0, color: 'bg-red-500', percentage: 0 }
              ].map((item) => {
                const total = (analytics?.difficulty.EASY || 0) + (analytics?.difficulty.MEDIUM || 0) + (analytics?.difficulty.HARD || 0)
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                return (
                  <div key={item.difficulty} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded ${item.color} mr-3`}></div>
                        <span className="text-sm font-medium text-foreground">{item.difficulty}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.count} ({percentage}%)
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Popular Problem Tags
            </h3>
            <div className="space-y-3">
              {analytics?.popularTags.map((tag, index) => {
                const maxCount = Math.max(...analytics.popularTags.map(t => t.count))
                const percentage = maxCount > 0 ? (tag.count / maxCount) * 100 : 0
                return (
                  <div key={tag.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{tag.name}</span>
                      <span className="text-sm text-muted-foreground">{tag.count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              }) || (
                <p className="text-sm text-muted-foreground">No tag data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Problems */}
          <div className="bg-card border border-border rounded-lg">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Recent Problems
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.recent.problems.length ? analytics.recent.problems.map((problem) => (
                  <div key={problem.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <div>
                      <p className="font-medium text-foreground">{problem.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          problem.difficulty === 'EASY' ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900' :
                          problem.difficulty === 'MEDIUM' ? 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900' :
                          'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900'
                        }`}>
                          {problem.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(problem.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No recent problems</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-card border border-border rounded-lg">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Recent Users
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.recent.users.length ? analytics.recent.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <div>
                      <p className="font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No recent users</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage