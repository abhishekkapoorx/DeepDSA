"use client"
import React, { useState, useEffect } from 'react'
import { BarChart3, Users, Trophy, Clock, TrendingUp, Award } from 'lucide-react'

interface ContestAnalyticsProps {
  contestSlug: string
}

interface AnalyticsData {
  overview: {
    totalRegistrations: number
    avgScore: number
    avgProblemsSolved: number
    contestDuration: number
    totalProblems: number
    maxParticipants: number | null
  }
  registrationTimeline: {
    hourly: Record<string, number>
    daily: Record<string, number>
    timeline: Array<{
      date: string
      time: string
      clerkId: string
      score: number
      problemsSolved: number
    }>
  }
  scoreDistribution: Array<{
    range: string
    count: number
  }>
  problemStats: Array<{
    title: string
    slug: string
    difficulty: string
    points: number
    order: number
  }>
  topPerformers: Array<{
    clerkId: string
    score: number
    problemsSolved: number
    registeredAt: string
  }>
  contestInfo: {
    title: string
    startTime: string
    endTime: string
    difficulty: string
  }
}

const ContestAnalytics = ({ contestSlug }: ContestAnalyticsProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [contestSlug])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/contests/${contestSlug}/analytics`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error || 'Failed to load analytics'}</p>
      </div>
    )
  }

  const { overview, registrationTimeline, scoreDistribution, problemStats, topPerformers } = analytics

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Registrations</p>
              <p className="text-2xl font-bold text-foreground">{overview.totalRegistrations}</p>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold text-foreground">{overview.avgScore}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Problems Solved</p>
              <p className="text-2xl font-bold text-foreground">{overview.avgProblemsSolved}</p>
            </div>
            <Trophy className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contest Duration</p>
              <p className="text-2xl font-bold text-foreground">{overview.contestDuration}m</p>
            </div>
            <Clock className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Registration Timeline */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Registration Timeline</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Registrations */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-3">Daily Registrations</h4>
            <div className="space-y-2">
              {Object.entries(registrationTimeline.daily).map(([date, count]) => (
                <div key={date} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{new Date(date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-accent rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(registrationTimeline.daily))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hourly Registrations */}
          <div>
            <h4 className="text-md font-medium text-foreground mb-3">Peak Registration Hours</h4>
            <div className="space-y-2">
              {Object.entries(registrationTimeline.hourly)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([hour, count]) => (
                <div key={hour} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{hour}:00</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-accent rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(registrationTimeline.hourly))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Score Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {scoreDistribution.map((range) => (
            <div key={range.range} className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">{range.count}</div>
              <div className="text-sm text-muted-foreground">{range.range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Problem Statistics */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Problem Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-foreground">Order</th>
                <th className="text-left p-3 text-sm font-medium text-foreground">Title</th>
                <th className="text-left p-3 text-sm font-medium text-foreground">Difficulty</th>
                <th className="text-left p-3 text-sm font-medium text-foreground">Points</th>
              </tr>
            </thead>
            <tbody>
              {problemStats.map((problem) => (
                <tr key={problem.slug} className="border-t border-border">
                  <td className="p-3 text-muted-foreground">{problem.order}</td>
                  <td className="p-3">
                    <div className="font-medium text-foreground">{problem.title}</div>
                    <div className="text-sm text-muted-foreground">{problem.slug}</div>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded capitalize ${
                      problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">{problem.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top Performers</h3>
        <div className="space-y-3">
          {topPerformers.map((performer, index) => (
            <div key={performer.clerkId} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-foreground">{performer.clerkId}</div>
                  <div className="text-sm text-muted-foreground">
                    {performer.problemsSolved} problems solved
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">{performer.score} pts</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(performer.registeredAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ContestAnalytics
