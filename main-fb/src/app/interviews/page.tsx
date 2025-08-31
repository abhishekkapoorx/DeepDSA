"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Star, 
  BarChart3,
  User
} from 'lucide-react';

interface Interview {
  _id: string;
  startedAt: string;
  endedAt?: string;
  score?: number;
  scoreBreakdown?: {
    correctness: number;
    approach: number;
    clarity: number;
    efficiency: number;
    communication: number;
  };
  suggestions?: string[];
  improvements?: string[];
  mistakes?: string[];
  summary?: string;
  problemSlug?: string;
}

interface InterviewStats {
  total: number;
  averageScore: number;
  totalTime: number;
  categories: {
    correctness: number;
    approach: number;
    clarity: number;
    efficiency: number;
    communication: number;
  };
}

export default function InterviewHistoryPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InterviewStats>({
    total: 0,
    averageScore: 0,
    totalTime: 0,
    categories: {
      correctness: 0,
      approach: 0,
      clarity: 0,
      efficiency: 0,
      communication: 0
    }
  });

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await fetch('/api/interviews');
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
        calculateStats(data.interviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (interviewList: Interview[]) => {
    if (!interviewList.length) return;
    
    const total = interviewList.length;
    const scores = interviewList
      .filter(i => i.score !== undefined)
      .map(i => i.score || 0);
    
    const averageScore = scores.length > 0 ? 
      scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    // Calculate category averages
    const categories = ['correctness', 'approach', 'clarity', 'efficiency', 'communication'] as const;
    const categoryStats = categories.map(cat => {
      const values = interviewList
        .filter(i => i.scoreBreakdown?.[cat])
        .map(i => i.scoreBreakdown?.[cat] || 0);
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    });
    
    setStats({
      total,
      averageScore,
      totalTime: 0,
      categories: {
        correctness: categoryStats[0],
        approach: categoryStats[1],
        clarity: categoryStats[2],
        efficiency: categoryStats[3],
        communication: categoryStats[4]
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading interview history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Interview History & Analytics
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your progress and see detailed feedback from all interviews
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All time interviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Out of 10</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Average</p>
            </CardContent>
          </Card>
        </div>

        {/* Interview List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recent Interviews</h2>
          {interviews.map((interview, index) => (
            <InterviewCard key={interview._id} interview={interview} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Interview Card Component
const InterviewCard: React.FC<{ interview: Interview; index: number }> = ({ interview, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  const score = interview.score || 0;
  const scoreColor = score >= 8 ? 'text-green-600' : score >= 6 ? 'text-yellow-600' : 'text-red-600';
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant={index === 0 ? 'default' : 'secondary'}>
              #{index + 1}
            </Badge>
            <span className="font-medium">{interview.problemSlug || 'General'}</span>
          </div>
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {score}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {expanded ? (
          <div className="space-y-4">
            {/* Score Breakdown */}
            {interview.scoreBreakdown && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.entries(interview.scoreBreakdown).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm text-muted-foreground capitalize">{key}</div>
                    <div className="text-lg font-bold">{value}/10</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Suggestions */}
            {interview.suggestions && (
              <div>
                <h4 className="font-semibold mb-2">Suggestions</h4>
                <ul className="space-y-1">
                  {interview.suggestions?.slice(0, 3).map((suggestion, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Mistakes */}
            {interview.mistakes && interview.mistakes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Areas to Improve</h4>
                <ul className="space-y-1">
                  {interview.mistakes?.slice(0, 3).map((mistake, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {mistake}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {new Date(interview.startedAt).toLocaleDateString()}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {expanded ? 'Show Less' : 'Show Details'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
