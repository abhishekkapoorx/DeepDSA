'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Code, Users, BarChart3, Settings, TrendingUp, Calendar, Tag } from 'lucide-react'

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

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

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
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = [
    { 
      title: 'Total Problems', 
      value: analytics?.overview.totalProblems?.toString() || '0', 
      icon: Code, 
      color: 'text-green-500',
      growth: `+${analytics?.trends.problemsThisMonth || 0} this month`
    },
    { 
      title: 'Total Users', 
      value: analytics?.overview.totalUsers?.toString() || '0', 
      icon: Users, 
      color: 'text-blue-500',
      growth: 'Active community'
    },
    { 
      title: 'Test Cases', 
      value: analytics?.overview.totalTestCases?.toString() || '0', 
      icon: BarChart3, 
      color: 'text-purple-500',
      growth: 'Quality assured'
    },
    { 
      title: 'This Week', 
      value: analytics?.trends.problemsThisWeek?.toString() || '0', 
      icon: TrendingUp, 
      color: 'text-orange-500',
      growth: 'New problems added'
    },
  ]

  const quickActions = [
    { title: 'Create Problem', href: '/admin/problems/create', icon: Plus, color: 'bg-green-500 hover:bg-green-600' },
    { title: 'Manage Problems', href: '/admin/problems', icon: Code, color: 'bg-blue-500 hover:bg-blue-600' },
    { title: 'View Users', href: '/admin/users', icon: Users, color: 'bg-purple-500 hover:bg-purple-600' },
    { title: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: 'bg-orange-500 hover:bg-orange-600' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your LeetCode-style platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <p className="text-xs text-muted-foreground">{stat.growth}</p>
            </div>
          ))}
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Difficulty Distribution */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Problem Difficulty Distribution</h3>
            <div className="space-y-3">
              {[
                { difficulty: 'EASY', count: analytics?.difficulty.EASY || 0, color: 'bg-green-500' },
                { difficulty: 'MEDIUM', count: analytics?.difficulty.MEDIUM || 0, color: 'bg-yellow-500' },
                { difficulty: 'HARD', count: analytics?.difficulty.HARD || 0, color: 'bg-red-500' }
              ].map((item) => {
                const total = (analytics?.difficulty.EASY || 0) + (analytics?.difficulty.MEDIUM || 0) + (analytics?.difficulty.HARD || 0)
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                return (
                  <div key={item.difficulty} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded ${item.color} mr-3`}></div>
                      <span className="text-sm font-medium text-foreground">{item.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{item.count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Popular Tags</h3>
            <div className="space-y-3">
              {analytics?.popularTags.slice(0, 5).map((tag, index) => (
                <div key={tag.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-sm font-medium text-foreground">{tag.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{tag.count} problems</span>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No tag data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className={`${action.color} text-white rounded-lg p-6 transition-colors cursor-pointer`}>
                  <action.icon className="h-6 w-6 mb-2" />
                  <h3 className="font-semibold">{action.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Problems */}
          <div className="bg-card border border-border rounded-lg">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Recent Problems</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.recent.problems.length ? analytics.recent.problems.map((problem) => (
                  <div key={problem.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-foreground">{problem.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Difficulty: <span className={
                          problem.difficulty === 'EASY' ? 'text-green-600' :
                          problem.difficulty === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'
                        }>{problem.difficulty}</span>
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(problem.createdAt).toLocaleDateString()}
                    </span>
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
              <h2 className="text-xl font-semibold text-foreground">Recent Users</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.recent.users.length ? analytics.recent.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
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

export default AdminDashboard