"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { IContest } from '@/models'

const ContestDetailPage = () => {
  const params = useParams()
  const slug = params.slug as string
  const [contest, setContest] = useState<IContest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`/api/contests/${slug}`)
        if (!response.ok) {
          throw new Error('Failed to fetch contest')
        }
        const data = await response.json()
        setContest(data)
        setIsRegistered(data.isRegistered || false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contest')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchContest()
    }
  }, [slug])

  // Update time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRegister = async () => {
    if (!contest) return
    
    setRegistering(true)
    try {
      const response = await fetch(`/api/contests/${contest.slug}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to register')
      }
      
      const data = await response.json()
      alert(data.message)
      setIsRegistered(true)
      
      // Refresh contest data
      const refreshResponse = await fetch(`/api/contests/${slug}`)
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        setContest(refreshData)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  const getContestStatus = () => {
    if (!contest) return 'unknown'
    const start = new Date(contest.startTime)
    const end = new Date(contest.endTime)
    
    if (now < start) return 'upcoming'
    if (now > end) return 'ended'
    return 'running'
  }

  const getTimeUntilStart = () => {
    if (!contest) return { hh: 0, mm: 0, ss: 0 }
    const ms = Math.max(0, new Date(contest.startTime).getTime() - now.getTime())
    const hh = Math.floor(ms / 3600000)
    const mm = Math.floor((ms % 3600000) / 60000)
    const ss = Math.floor((ms % 60000) / 1000)
    return { hh, mm, ss }
  }

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading contest...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-red-500">{error || 'Contest not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const status = getContestStatus()
  const { hh, mm, ss } = getTimeUntilStart()

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">{contest.title}</h1>
          <p className="text-lg text-muted-foreground">{contest.description}</p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-accent rounded-full capitalize">{status}</span>
            <span className="px-3 py-1 bg-accent rounded-full">{contest.difficulty}</span>
            {contest.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-accent rounded-full">{tag}</span>
            ))}
          </div>
        </div>

        {/* Contest Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Contest Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Start Time:</span>
                <span className="ml-2 text-foreground">{new Date(contest.startTime).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">End Time:</span>
                <span className="ml-2 text-foreground">{new Date(contest.endTime).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>
                <span className="ml-2 text-foreground">{contest.duration} minutes</span>
              </div>
              <div>
                <span className="text-muted-foreground">Participants:</span>
                <span className="ml-2 text-foreground">
                  {(contest as any).registrationCount || 0}
                  {contest.maxParticipants && ` / ${contest.maxParticipants}`}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Registration</h3>
            {status === 'upcoming' ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Contest starts in</div>
                  <div className="text-3xl font-bold text-primary">
                    {pad(hh)}:{pad(mm)}:{pad(ss)}
                  </div>
                </div>
                <button
                  onClick={handleRegister}
                  disabled={registering || isRegistered}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {registering ? 'Registering...' : isRegistered ? 'Registered' : 'Register Now'}
                </button>
              </div>
            ) : status === 'running' ? (
              <div className="text-center space-y-4">
                <div className="text-lg font-semibold text-green-600 mb-2">Contest is Live!</div>
                {isRegistered ? (
                  <a
                    href={`/contests/${slug}/test`}
                    className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Start Solving Problems
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">You must be registered to participate</p>
                )}
                <a
                  href={`/contests/${slug}/standings`}
                  className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mt-2"
                >
                  View Standings
                </a>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-lg font-semibold text-muted-foreground mb-2">Contest Ended</div>
                <p className="text-sm text-muted-foreground">This contest has concluded.</p>
                <a
                  href={`/contests/${slug}/standings`}
                  className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 mt-4"
                >
                  View Standings
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Problems - Only show if contest is running or ended */}
        {contest.problems && contest.problems.length > 0 && status !== 'upcoming' && (
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Problems</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contest.problems.map((problem, i) => (
                <a
                  key={i}
                  href={`/contests/${slug}/problems/${problem.problemSlug}`}
                  className="border border-border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-foreground">
                      {(problem.problemId as any)?.title || `Problem ${i + 1}`}
                    </h4>
                    <span className="text-sm text-muted-foreground">{problem.points} pts</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Difficulty: {(problem.problemId as any)?.difficulty || 'Mixed'}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Info message for upcoming contests */}
        {status === 'upcoming' && (
          <div className="border border-border rounded-lg p-6 bg-muted/50">
            <p className="text-center text-muted-foreground">
              🔒 Problems will be available when the contest starts
            </p>
          </div>
        )}

        {/* Rules */}
        {contest.rules && contest.rules.length > 0 && (
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Rules</h3>
            <ul className="space-y-2">
              {contest.rules.map((rule, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start">
                  <span className="text-primary mr-2">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prizes */}
        {contest.prizes && contest.prizes.length > 0 && (
          <div className="border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Prizes</h3>
            <ul className="space-y-2">
              {contest.prizes.map((prize, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start">
                  <span className="text-primary mr-2">🏆</span>
                  {prize}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContestDetailPage
