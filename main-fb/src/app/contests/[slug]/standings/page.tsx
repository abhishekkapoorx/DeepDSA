"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Trophy, Medal, Clock, CheckCircle } from 'lucide-react'

interface Contestant {
  clerkId: string
  username: string
  score: number
  problemsSolved: number
  submissions: any[]
  solvedProblems: string[]
  registrationTime: Date
}

const ContestStandingsPage = () => {
  const params = useParams()
  const slug = params.slug as string
  
  const [contest, setContest] = useState<any>(null)
  const [standings, setStandings] = useState<Contestant[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/contests/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setContest(data)
          
          // Sort by score (descending), then by time (ascending)
          const sortedStandings = data.registrations
            .filter((reg: any) => reg.score !== undefined && reg.score > 0)
            .sort((a: any, b: any) => {
              if (b.score !== a.score) return b.score - a.score
              return new Date(a.registrationTime).getTime() - new Date(b.registrationTime).getTime()
            })
          
          setStandings(sortedStandings)
        }
      } catch (err) {
        console.error('Error fetching contest:', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug])

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-500" />
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
  }

  const getTotalPoints = () => {
    if (!contest?.problems) return 0
    return contest.problems.reduce((sum: number, p: any) => sum + (p.points || 0), 0)
  }

  const getTimeRemaining = () => {
    if (!contest) return null
    const diff = new Date(contest.endTime).getTime() - now.getTime()
    if (diff <= 0) return 'Contest Ended'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    return `${hours}h ${minutes}m ${seconds}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb- highest">
          <h1 className="text-3xl font-bold text-foreground mb-2">{contest?.title} - Standings</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>{standings.length} participants</span>
            <span>•</span>
            <span>{getTotalPoints()} total points</span>
            {getTimeRemaining() && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{getTimeRemaining()}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Standings Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Username</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Score</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Problems Solved</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Solved</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((contestant, index) => (
                  <tr 
                    key={contestant.clerkId} 
                    className="border-t border-border hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index + 1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{contestant.username || 'Anonymous'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-primary">{contestant.score || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-muted-foreground">{contestant.problemsSolved || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {contestant.solvedProblems?.map((problemId: string, idx: number) => (
                          <CheckCircle key={idx} className="h-4 w-4 text-green-500" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {standings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No submissions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContestStandingsPage

