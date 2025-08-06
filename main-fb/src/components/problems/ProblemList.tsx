import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Problem {
  _id: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  createdAt: string;
  // Mock data for now - these would come from user progress tracking
  successRate?: number;
  isSolved?: boolean;
  progress?: number;
}

interface ProblemListProps {
  selectedTopic: string;
  searchQuery: string;
}

export default function ProblemList({ selectedTopic, searchQuery }: ProblemListProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch problems from API
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (selectedTopic !== 'All Topics') {
          params.append('tags', selectedTopic);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        const response = await fetch(`/api/problems?${params.toString()}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Problems API response:', data);
          // Add mock data for success rate, isSolved, and progress
          const problemsWithMockData = data.problems.map((problem: Problem) => ({
            ...problem,
            successRate: Math.floor(Math.random() * 60) + 20, // Random success rate 20-80%
            isSolved: Math.random() > 0.7, // 30% chance of being solved
            progress: Math.random() > 0.7 ? 100 : Math.floor(Math.random() * 100) // Random progress
          }));
          setProblems(problemsWithMockData);
        } else {
          const errorData = await response.json();
          console.error('Failed to load problems:', errorData);
          setError('Failed to load problems');
        }
      } catch (err) {
        console.error('Error fetching problems:', err);
        setError('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [selectedTopic, searchQuery]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-500';
      case 'MEDIUM':
        return 'text-yellow-500';
      case 'HARD':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'Easy';
      case 'MEDIUM':
        return 'Medium';
      case 'HARD':
        return 'Hard';
      default:
        return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading problems...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="space-y-2">
                     {problems.map((problem) => {
             console.log('Problem data:', problem);
             // Generate slug from title if not provided
             const problemSlug = problem.slug || problem.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
             
             return (
               <Link
                 key={problem._id}
                 href={`/problems/${problemSlug}`}
                 className="block"
               >
              <div className="flex items-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors">
                {/* Problem Number and Title */}
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {problem.isSolved && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm font-medium text-muted-foreground">
                      {problem._id.slice(-4)}.
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {problem.title}
                  </span>
                </div>

                {/* Success Rate */}
                <div className="text-xs text-muted-foreground w-16 text-right">
                  {problem.successRate || 0}%
                </div>

                {/* Difficulty */}
                <div className={`text-xs font-medium w-12 text-right ${getDifficultyColor(problem.difficulty)}`}>
                  {getDifficultyLabel(problem.difficulty)}
                </div>

                {/* Progress Bar */}
                <div className="w-20 ml-4">
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full transition-all duration-300"
                      style={{ width: `${problem.progress || 0}%` }}
                    />
                  </div>
                                 </div>
               </div>
             </Link>
           );
         })}
        </div>
      </div>
    </div>
  );
} 