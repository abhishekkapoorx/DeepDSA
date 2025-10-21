"use client"
import React, { useEffect, useState } from 'react'
import type { IContest } from '@/models'

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

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'running', label: 'Running' },
    { key: 'ended', label: 'Ended' },
    { key: 'all', label: 'All' },
  ]

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Contests</h1>

        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`px-3 py-1.5 rounded-md border text-sm ${status === t.key ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : contests.length === 0 ? (
          <div className="text-muted-foreground">No contests found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contests.map((c) => {
              const start = new Date(c.startTime)
              const end = new Date(c.endTime)
              const derivedStatus = new Date() < start ? 'upcoming' : (new Date() > end ? 'ended' : 'running')
              return (
                <div key={c.slug} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{c.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-accent text-foreground capitalize">
                      {status === 'all' ? derivedStatus : status}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    <div>Starts: {start.toLocaleString()}</div>
                    <div>Ends: {end.toLocaleString()}</div>
                    <div className="mt-1">Participants: {(c as any).registrationCount}{c.maxParticipants ? ` / ${(c as any).maxParticipants}` : ''}</div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a href={`/contests/${c.slug}`} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90">View Details</a>
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


