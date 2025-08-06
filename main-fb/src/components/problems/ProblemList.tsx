"use client"
import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  questionNumber: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  createdAt: string;
}

interface ProblemListProps {
  selectedTopic: string;
  searchQuery: string;
}

export default function ProblemList({ selectedTopic, searchQuery }: ProblemListProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`/api/problems?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProblems(data.problems);
      } else {
        console.error('Failed to fetch problems:', data.error);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [searchQuery]);

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

  const filteredProblems = problems.filter(problem => {
    const matchesTopic = selectedTopic === 'All Topics' || 
      problem.tags.some(tag => tag.toLowerCase().includes(selectedTopic.toLowerCase()));
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         problem.questionNumber.toString().includes(searchQuery);
    return matchesTopic && matchesSearch;
  });

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="space-y-2">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No problems found.
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div
                key={problem._id}
                className="flex items-center p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
              >
                {/* Problem Number and Title */}
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {problem.questionNumber}.
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {problem.title}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mr-4">
                  {problem.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                  {problem.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{problem.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Difficulty */}
                <div className={`text-xs font-medium w-16 text-right ${getDifficultyColor(problem.difficulty)}`}>
                  {getDifficultyLabel(problem.difficulty)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 