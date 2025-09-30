import React from 'react'

const DiscussPage = () => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Discuss</h1>
          <p className="text-muted-foreground">Ask questions, share insights, and help others.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map((i) => (
            <div key={i} className="border border-border rounded-lg p-5 hover:bg-accent/40 transition">
              <div className="text-xs text-muted-foreground mb-1">Thread</div>
              <h3 className="text-lg font-semibold text-foreground">How to approach DP {i}?</h3>
              <p className="text-sm text-muted-foreground mt-1">Share your strategies and common pitfalls.</p>
              <div className="mt-3 text-xs text-muted-foreground">12 replies • Last reply 1h ago</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DiscussPage