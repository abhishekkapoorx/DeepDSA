'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopicCount {
  name: string;
  count: number;
}

// Exhaustive default topics (kept in sync with admin create page suggestions)
const DEFAULT_TOPICS: TopicCount[] = [
  'Array','String','Hash Table','Dynamic Programming','Math','Sorting','Greedy','Depth-First Search','Binary Search','Database','Matrix','Tree','Breadth-First Search','Bit Manipulation','Two Pointers','Prefix Sum','Heap (Priority Queue)','Simulation','Binary Tree','Graph','Stack','Counting','Sliding Window','Design','Enumeration','Backtracking','Union Find','Linked List','Number Theory','Ordered Set','Monotonic Stack','Segment Tree','Trie','Combinatorics','Bitmask','Divide and Conquer','Queue','Recursion','Geometry','Binary Indexed Tree','Memoization','Hash Function','Binary Search Tree','Shortest Path','String Matching','Topological Sort','Rolling Hash','Game Theory','Interactive','Data Stream','Monotonic Queue','Brainteaser','Doubly-Linked List','Randomized','Merge Sort','Counting Sort','Iterator','Concurrency','Probability and Statistics','Quickselect','Suffix Array','Line Sweep','Minimum Spanning Tree','Bucket Sort','Shell','Reservoir Sampling','Strongly Connected Component','Eulerian Circuit','Radix Sort','Rejection Sampling','Biconnected Component'
].map((name) => ({ name, count: 0 }));

const filterTypes = [
  'All Topics',
  'Algorithms',
  'Database',
  'Shell',
  'Concurrency',
  'JavaScript',
  'pandas'
];

interface TopicFiltersProps {
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  problems?: Array<{ tags?: string[] }>;
}

export default function TopicFilters({ 
  selectedTopic, 
  onTopicChange, 
  searchQuery, 
  onSearchChange,
  problems
}: TopicFiltersProps) {
  const [topics, setTopics] = useState<TopicCount[]>(DEFAULT_TOPICS);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If problems are provided from parent, aggregate client-side and skip fetching
    if (Array.isArray(problems)) {
      const map = new Map<string, number>();
      for (const d of DEFAULT_TOPICS) map.set(d.name, d.count);
      for (const p of problems) {
        const tags: string[] = Array.isArray(p.tags) ? p.tags : [];
        for (const tag of tags) map.set(tag, (map.get(tag) || 0) + 1);
      }
      const agg: TopicCount[] = Array.from(map, ([name, count]) => ({ name, count }));
      setTopics(agg);
      return;
    }
    let cancelled = false;
    const fetchTags = async () => {
      setLoading(true);
      try {
        // Try an analytics-based source first (if available)
        let data: any = null;
        try {
          const res = await fetch('/api/admin/analytics', { cache: 'no-store' });
          if (res.ok) {
            data = await res.json();
            if (data?.popularTags) {
              const counts = (data.popularTags as any[]).map(t => ({ name: t.name as string, count: Number(t.count) || 0 }));
              if (!cancelled && counts.length) {
                // Merge with defaults so all topics are present
                const map = new Map<string, number>();
                for (const d of DEFAULT_TOPICS) map.set(d.name, d.count);
                for (const c of counts) map.set(c.name, (map.get(c.name) || 0) + c.count);
                const merged: TopicCount[] = Array.from(map, ([name, count]) => ({ name, count }));
                setTopics(merged);
                return;
              }
            }
          }
        } catch {}

        // Fallback: fetch problems and aggregate tags client-side
        const res2 = await fetch('/api/problems?limit=500', { cache: 'no-store' });
        if (res2.ok) {
          const list = await res2.json();
          const problems = list?.problems || [];
          const map = new Map<string, number>();
          // seed with defaults so all known topics appear
          for (const d of DEFAULT_TOPICS) map.set(d.name, d.count);
          for (const p of problems) {
            const tags: string[] = Array.isArray(p.tags) ? p.tags : [];
            for (const tag of tags) {
              map.set(tag, (map.get(tag) || 0) + 1);
            }
          }
          const agg: TopicCount[] = Array.from(map.entries()).map(([name, count]) => ({ name, count }));
          if (!cancelled && agg.length) {
            setTopics(agg);
          }
        }
      } catch (e) {
        // leave defaults on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTags();
    return () => { cancelled = true; };
  }, []);

  const visibleTopics = useMemo(() => {
    const list = [...topics].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return expanded ? list : list.slice(0, 12);
  }, [topics, expanded]);

  const handleTagClick = (name: string) => {
    onTopicChange(name);
  };

  return (
    <div className="space-y-4">
      {/* Topic Tags */}
      <div className="flex flex-wrap gap-2">
        {visibleTopics.map((topic) => (
          <button
            key={topic.name}
            onClick={() => handleTagClick(topic.name)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedTopic === topic.name ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'}`}
          >
            {topic.name} {topic.count > 0 ? topic.count : ''}
          </button>
        ))}
        {([...topics].length > 12) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-3 py-1 text-xs text-primary hover:bg-accent rounded-full"
          >
            {expanded ? 'Show less' : 'Show all'}
          </button>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filterTypes.map((type) => (
          <Button
            key={type}
            variant={selectedTopic === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTopicChange(type)}
            className="rounded-full"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Search and Progress */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Q Search questions"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <button className="p-2 hover:bg-accent rounded">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">181/3631 Solved</div>
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="16"
                cy="16"
                r="14"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray="88"
                strokeDashoffset="26.4"
                className="text-primary"
                style={{
                  strokeDasharray: 88,
                  strokeDashoffset: 88 - (88 * 181) / 3631
                }}
              />
            </svg>
            <button className="absolute inset-0 flex items-center justify-center">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 