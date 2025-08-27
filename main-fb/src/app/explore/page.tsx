import React from 'react'

const ExplorePage = () => {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Explore</h1>
          <p className="text-muted-foreground">Discover curated tracks, topics, and hand-picked problem sets.</p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="border border-border rounded-lg p-5 hover:bg-accent/40 transition">
              <div className="text-xs text-muted-foreground mb-1">Collection</div>
              <h3 className="text-lg font-semibold text-foreground">Getting Started {i}</h3>
              <p className="text-sm text-muted-foreground mt-1">A starter pack of easy problems to warm up.</p>
              <div className="mt-4 text-xs text-muted-foreground">12 problems • ~45 mins</div>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Trending Topics</h2>
          <div className="flex flex-wrap gap-2">
            {['Array','Two Pointers','Graph','DP','Greedy','Binary Search','Math','Tree'].map(tag => (
              <span key={tag} className="px-3 py-1 text-xs rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground cursor-default">
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ExplorePage