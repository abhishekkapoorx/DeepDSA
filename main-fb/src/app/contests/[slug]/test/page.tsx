"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { IContest } from '@/models'
import { Clock, Trophy, ArrowLeft } from 'lucide-react'

const ContestTestPage = () => {
  const params = useParams()
  const slug = params.slug as string
  const [contest, setContest] = useState<IContest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState<Date>(new Date())
  const [startTime, setStartTime] = useState<Date | null>(null)

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const response = await fetch(`/api/contests/${slug}`)
        if (!response.ok) {
          throw new Error('Failed to fetch contest')
        }
        const data = await response.json()
        setContest(data)
        setStartTime(new Date())
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

  // Update time every second for timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getTimeRemaining = () => {
    if (!contest || !startTime) return { hours: 0, minutes: 0, seconds: 0 }
    const end = new Date(contest.endTime)
    const elapsed = now.getTime() - startTime.getTime()
    const remaining = Math.max(0, end.getTime() - now.getTime())
    
    const hours = Math.floor(remaining / 3600000)
    const minutes = Math.floor((remaining % 3600000) / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    
    return { hours, minutes, seconds }
  }

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
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
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-red-500">{error || 'Contest not found'}</p>
            <a href={`/contests/${slug}`} className="mt-4 inline-block text-primary hover:underline">
              Back to Contest
            </a>
          </div>
        </div>
      </div>
    )
  }

  const { hours, minutes, seconds } = getTimeRemaining()
  const isExpired = hours === 0 && minutes === 0 && seconds === 0

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <a 
            href={`/contests/${slug}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contest
          </a>
          <h1 className="text-3xl font-bold text-foreground">{contest.title}</h1>
        </div>

        {/* Timer and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Time Remaining</h3>
            </div>
            {isExpired ? (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">Time's Up!</div>
                <p className="text-sm text-muted-foreground mt-2">Contest has ended</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">hours : minutes : seconds</p>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <h3 className="text-lg font-semibold text-foreground">Problems</h3>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">
                {contest.problems.length}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Total Problems</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-semibold text-foreground">Total Points</h3>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-foreground">
                {contest.problems.reduce((sum, p) => sum + p.points, 0)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Possible Points</p>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Problems</h2>
          <div className="space-y-4">
            {contest.problems.map((problem, index) => (
              <a
                key={index}
                href={`/contests/${slug}/problems/${problem.problemSlug}`}
                className="block border border-border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {(problem.problemId as any)?.title || `Problem ${index + 1}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Difficulty: {(problem.problemId as any)?.difficulty || 'Mixed'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{problem.points}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-muted/50 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Instructions</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              You have {contest.duration} minutes to solve all problems
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Each problem has different point values based on difficulty
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Submit your solutions before the time runs out
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Points are awarded based on test cases passed
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Good luck! 🍀
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ContestTestPage

