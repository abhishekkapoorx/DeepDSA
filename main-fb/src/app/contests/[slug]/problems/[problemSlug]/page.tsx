"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'
import type { Problem } from '@/components/problems'

const ContestProblemPage = () => {
  const params = useParams()
  const slug = params.slug as string
  const problemSlug = params.problemSlug as string
  
  const [contest, setContest] = useState<any>(null)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState<Date>(new Date())
  const [contestProblem, setContestProblem] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch contest details
        const contestResponse = await fetch(`/api/contests/${slug}`)
        if (!contestResponse.ok) throw new Error('Failed to fetch contest')
        const contestData = await contestResponse.json()
        setContest(contestData)
        
        // Find the problem in contest
        const cp = contestData.problems.find((p: any) => p.problemSlug === problemSlug)
        if (!cp) throw new Error('Problem not found in contest')
        setContestProblem(cp)
        
        // Fetch problem details
        const problemResponse = await fetch(`/api/problems/${problemSlug}`)
        if (!problemResponse.ok) throw new Error('Failed to fetch problem')
        const problemData = await problemResponse.json()
        setProblem(problemData)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load problem')
      } finally {
        setLoading(false)
      }
    }

    if (slug && problemSlug) {
      fetchData()
    }
  }, [slug, problemSlug])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getTimeRemaining = () => {
    if (!contest) return { hours: 0, minutes: 0, seconds: 0 }
    const end = new Date(contest.endTime)
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
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading problem...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !problem || !contest) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-red-500">{error || 'Problem not found'}</p>
            <a href={`/contests/${slug}/test`} className="mt-4 inline-block text-primary hover:underline">
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header with Timer */}
        <div className="mb-6">
          <a 
            href={`/contests/${slug}/test`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contest
          </a>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{problem.title}</h1>
              <p className="text-muted-foreground mt-1">{contest.title}</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Time Remaining</span>
              </div>
              {isExpired ? (
                <div className="text-xl font-bold text-red-600">Time's Up!</div>
              ) : (
                <div className="text-2xl font-bold text-primary">
                  {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Problem Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Points</div>
            <div className="text-2xl font-bold text-primary">{contestProblem.points}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Difficulty</div>
            <div className="text-2xl font-bold text-foreground capitalize">{problem.difficulty}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="text-2xl font-bold text-green-600">Not Solved</div>
          </div>
        </div>

        {/* Problem Description and Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Problem Description */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Description</h2>
              <div className="prose prose-sm max-w-none text-foreground">
                <div dangerouslySetInnerHTML={{ __html: problem.description }} />
              </div>
            </div>

            {/* Examples */}
            {problem.testcases && problem.testcases.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Examples</h2>
                <div className="space-y-4">
                  {problem.testcases
                    .filter((tc: any) => tc.isExample)
                    .map((testcase: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-foreground">Example {index + 1}:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Input:</div>
                            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                              {testcase.input}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Output:</div>
                            <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                              {testcase.output}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Constraints */}
            {problem.constraints && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Constraints</h2>
                <div className="prose prose-sm max-w-none text-foreground">
                  <div dangerouslySetInnerHTML={{ __html: problem.constraints }} />
                </div>
              </div>
            )}
          </div>

          {/* Right: Code Editor Redirect */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Solution</h2>
            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
              <p className="text-sm text-foreground font-medium mb-2">
                This problem is worth {contestProblem.points} points
              </p>
              <p className="text-xs text-muted-foreground">
                Solve it within the contest time to earn points!
              </p>
            </div>
            <a
              href={`/problems/${problemSlug}`}
              className="block w-full px-4 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-center font-medium"
            >
              Open in Code Editor
            </a>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              ⚡ Tip: Your submissions during the contest will be tracked automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContestProblemPage

