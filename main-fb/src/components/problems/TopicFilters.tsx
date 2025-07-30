import { Search, ChevronDown, ArrowUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const topics = [
  { name: 'Array', count: 1960 },
  { name: 'String', count: 808 },
  { name: 'Hash Table', count: 718 },
  { name: 'Dynamic Programming', count: 606 },
  { name: 'Math', count: 603 },
  { name: 'Sorting', count: 461 },
  { name: 'Greedy', count: 423 },
  { name: 'Depth-First Search', count: 330 },
  { name: 'Binary Search', count: 250 }
];

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
}

export default function TopicFilters({ 
  selectedTopic, 
  onTopicChange, 
  searchQuery, 
  onSearchChange 
}: TopicFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Topic Tags */}
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <button
            key={topic.name}
            className="px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full hover:bg-accent hover:text-foreground transition-colors"
          >
            {topic.name} {topic.count}
          </button>
        ))}
        <button className="px-3 py-1 text-xs text-primary hover:bg-accent rounded-full">
          Expand
        </button>
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