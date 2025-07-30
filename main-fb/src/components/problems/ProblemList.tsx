import { CheckCircle } from 'lucide-react';

interface Problem {
  id: number;
  title: string;
  successRate: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isSolved: boolean;
  progress: number;
}

const problems: Problem[] = [
  {
    id: 2419,
    title: "Longest Subarray With Maximum Bitwise AND",
    successRate: 62.8,
    difficulty: 'Medium',
    isSolved: false,
    progress: 0
  },
  {
    id: 1,
    title: "Two Sum",
    successRate: 56.0,
    difficulty: 'Easy',
    isSolved: true,
    progress: 100
  },
  {
    id: 2,
    title: "Add Two Numbers",
    successRate: 46.5,
    difficulty: 'Medium',
    isSolved: true,
    progress: 100
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    successRate: 37.2,
    difficulty: 'Medium',
    isSolved: true,
    progress: 100
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    successRate: 44.2,
    difficulty: 'Hard',
    isSolved: true,
    progress: 100
  },
  {
    id: 5,
    title: "Longest Palindromic Substring",
    successRate: 36.1,
    difficulty: 'Medium',
    isSolved: false,
    progress: 0
  },
  {
    id: 6,
    title: "Zigzag Conversion",
    successRate: 51.9,
    difficulty: 'Medium',
    isSolved: false,
    progress: 0
  },
  {
    id: 7,
    title: "Reverse Integer",
    successRate: 30.5,
    difficulty: 'Medium',
    isSolved: false,
    progress: 0
  },
  {
    id: 8,
    title: "String to Integer (atoi)",
    successRate: 19.5,
    difficulty: 'Medium',
    isSolved: false,
    progress: 0
  }
];

interface ProblemListProps {
  selectedTopic: string;
  searchQuery: string;
}

export default function ProblemList({ selectedTopic, searchQuery }: ProblemListProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'Hard':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesTopic = selectedTopic === 'All Topics' || true; // Add topic filtering logic
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         problem.id.toString().includes(searchQuery);
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="space-y-2">
          {filteredProblems.map((problem) => (
            <div
              key={problem.id}
              className="flex items-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
            >
              {/* Problem Number and Title */}
              <div className="flex-1 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {problem.isSolved && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm font-medium text-muted-foreground">
                    {problem.id}.
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {problem.title}
                </span>
              </div>

              {/* Success Rate */}
              <div className="text-xs text-muted-foreground w-16 text-right">
                {problem.successRate}%
              </div>

              {/* Difficulty */}
              <div className={`text-xs font-medium w-12 text-right ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </div>

              {/* Progress Bar */}
              <div className="w-20 ml-4">
                <div className="w-full bg-muted rounded-full h-1">
                  <div
                    className="bg-primary h-1 rounded-full transition-all duration-300"
                    style={{ width: `${problem.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 