"use client"
import React, { useEffect, useState } from 'react'

const ContestPage = () => {
  const [now, setNow] = useState<Date>(new Date())
  // Dummy contest start time: today at 8 PM
  const start = new Date()
  start.setHours(20, 0, 0, 0)
  if (start.getTime() < Date.now()) {
    // if past 8 PM, set to tomorrow 8 PM
    start.setDate(start.getDate() + 1)
  }

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const ms = Math.max(0, start.getTime() - now.getTime())
  const hh = Math.floor(ms / 3600000)
  const mm = Math.floor((ms % 3600000) / 60000)
  const ss = Math.floor((ms % 60000) / 1000)
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">Weekly Contest</h1>
          <p className="text-muted-foreground">Sharpen your skills in a timed environment.</p>
        </header>

        <div className="border border-border rounded-lg p-8 text-center">
          <div className="text-sm text-muted-foreground mb-1">Contest starts in</div>
          <div className="text-4xl font-bold text-primary">{pad(hh)}:{pad(mm)}:{pad(ss)}</div>
          <div className="mt-4 flex justify-center gap-3">
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Register</button>
            <button className="px-4 py-2 rounded-md border border-border hover:bg-accent">Rules</button>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="border border-border rounded-lg p-5">
              <div className="text-xs text-muted-foreground mb-1">Practice Set</div>
              <h3 className="text-lg font-semibold text-foreground">Warmup #{i}</h3>
              <p className="text-sm text-muted-foreground mt-1">Get ready with hand-picked problems.</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default ContestPage
