import React from 'react';

export interface Problem {
  title: string;
  description: string;
  questionNumber: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  starterCode: string;
  testcases: TestCase[];
}

export interface TestCase {
  input: string;
  output: string;
}

interface ProblemDescriptionProps {
  problem: Pick<Problem, 'title' | 'description' | 'questionNumber' | 'difficulty'>;
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem }) => {
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

  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return `<h1 class="text-2xl font-bold mb-4">${line.slice(2)}</h1>`;
        }
        if (line.startsWith('## ')) {
          return `<h2 class="text-xl font-semibold mb-3 mt-6">${line.slice(3)}</h2>`;
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-lg font-medium mb-2 mt-4">${line.slice(4)}</h3>`;
        }
        
        // Bold text
        if (line.includes('**')) {
          line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
        }
        
        // Lists
        if (line.startsWith('- ')) {
          return `<li class="ml-4 mb-1">${line.slice(2)}</li>`;
        }
        
        // Empty lines
        if (line.trim() === '') {
          return '<br>';
        }
        
        // Regular paragraphs
        return `<p class="mb-3 leading-relaxed">${line}</p>`;
      })
      .join('');
  };

  return (
    <div className="h-full w-full bg-card text-card-foreground">
      <div className="p-4 h-full overflow-y-auto">
        {/* Problem Header */}
        <div className="mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-bold ">
              {problem.questionNumber}.
            </span>
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <span className={`px-2  text-lg font-semibold rounded-full ${getDifficultyColor(problem.difficulty)} bg-opacity-10`}>
              {getDifficultyLabel(problem.difficulty)}
            </span>
          </div>
        </div>

        {/* Problem Description */}
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: renderMarkdown(problem.description) 
          }} 
        />
      </div>
    </div>
  );
};