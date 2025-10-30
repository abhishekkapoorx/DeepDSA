"use client"
import React, { useEffect, useState } from 'react'
import type { IContest } from '@/models'
import { Calendar, Clock, Users, Trophy, ChevronRight, Timer } from 'lucide-react'

type StatusFilter = 'all' | 'upcoming' | 'running' | 'ended'

const ContestsPage = () => {
  const [status, setStatus] = useState<StatusFilter>('upcoming')
  const [contests, setContests] = useState<IContest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContests = async (s: StatusFilter) => {
    setLoading(true)
    setError(null)
    try {
      const query = s === 'all' ? '?includeUnpublished=true' : `?status=${s}&includeUnpublished=true`
      const res = await fetch(`/api/contests${query}`)
      if (!res.ok) throw new Error('Failed to load contests')
      const data = await res.json()
      setContests(data.contests)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load contests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContests(status) }, [status])

  const tabs: { key: StatusFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'upcoming', label: 'Upcoming', icon: <Calendar className="h-4 w-4" /> },
    { key: 'running', label: 'Live', icon: <Timer className="h-4 w-4" /> },
    { key: 'ended', label: 'Past', icon: <Trophy className="h-4 w-4" /> },
    { key: 'all', label: 'All', icon: null },
  ]

  const getStatusBadge = (derivedStatus: string) => {
    switch (derivedStatus) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
            Live Now
          </span>
        )
      case 'upcoming':
        return (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Upcoming
          </span>
        )
      case 'ended':
        return (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Ended
          </span>
        )
      default:
        return null
    }
  }

  const formatDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime()
    const hours = Math.floor(durationMs / (1000 * 60 * 60))
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`
    }
    return `${minutes}m`
  }

  const getTimeUntil = (start: Date) => {
    const now = new Date()
    const diff = start.getTime() - now.getTime()
    
    if (diff <= 0) return 'Started'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `Starts in ${days}d ${hours}h`
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`
    return `Starts in ${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Contests</h1>
              <p className="text-muted-foreground mt-1">
                Compete with developers worldwide and showcase your skills
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm 
                transition-all duration-200 whitespace-nowrap
                ${status === t.key 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' 
                  : 'bg-card border border-border hover:bg-accent hover:border-accent-foreground/20'
                }
              `}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading contests...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : contests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-muted-foreground text-lg">No contests found</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later for new contests</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contests.map((c) => {
              const start = new Date(c.startTime)
              const end = new Date(c.endTime)
              const now = new Date()
              const derivedStatus = now < start ? 'upcoming' : (now > end ? 'ended' : 'running')
              const duration = formatDuration(start, end)
              const timeUntil = getTimeUntil(start)
              
              return (
                <div 
                  key={c.slug} 
                  className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Background gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {c.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {c.description}
                        </p>
                      </div>
                      {getStatusBadge(derivedStatus)}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Start Date</div>
                          <div className="font-medium text-foreground">
                            {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Duration</div>
                          <div className="font-medium text-foreground">{duration}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Participants</div>
                          <div className="font-medium text-foreground">
                            {(c as any).registrationCount || 0}
                            {c.maxParticipants ? ` / ${c.maxParticipants}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Trophy className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Problems</div>
                          <div className="font-medium text-foreground">
                            {c.problems?.length || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time Info */}
                    {derivedStatus === 'upcoming' && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-sm">
                          <Timer className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-blue-700 dark:text-blue-300">
                            {timeUntil}
                          </span>
                        </div>
                      </div>
                    )}

                    {derivedStatus === 'running' && (
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                          <span className="font-medium text-green-700 dark:text-green-300">
                            Contest is live now!
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <a 
                      href={`/contests/${c.slug}`} 
                      className="
                        flex items-center justify-center gap-2 w-full
                        px-4 py-3 rounded-xl font-semibold text-sm
                        bg-primary text-primary-foreground
                        hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20
                        transition-all duration-200
                        group-hover:scale-[1.02]
                      "
                    >
                      {derivedStatus === 'running' ? 'Join Contest' : 'View Details'}
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ContestsPage
