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
  isAbandoned?: boolean;
  isActive?: boolean;
  status?: 'abandoned' | 'active' | 'completed';
  messageCount?: number;
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
        // Parse any stringified JSON fields (handle old data format)
        console.log('Data:', data);
        const parsedInterviews = (data.interviews || []).map((interview: any) => {
          const parsed = { ...interview };
          
          // Check if summary contains JSON string (old or corrupted data format)
          if (typeof parsed.summary === 'string') {
            let trimmed = parsed.summary.trim();
            
            // Remove markdown code blocks if present
            if (trimmed.includes('```json')) {
              trimmed = trimmed.replace(/```json\n?/, '').replace(/\n?```$/, '').trim();
            } else if (trimmed.includes('```')) {
              trimmed = trimmed.replace(/```\n?/, '').replace(/\n?```$/, '').trim();
            }
            
            // If it's a JSON string, parse it
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              try {
                // Only try to parse if it looks complete (ends with } or ])
                if (!trimmed.endsWith('}') && !trimmed.endsWith(']')) {
                  throw new Error('Incomplete JSON string');
                }
                
                const parsedData = JSON.parse(trimmed);
                
                // Extract all fields from the parsed JSON
                if (parsedData.score !== undefined) parsed.score = parsedData.score;
                
                if (parsedData.breakdown) {
                  parsed.scoreBreakdown = {
                    correctness: parsedData.breakdown.correctness || parsed.scoreBreakdown?.correctness || 0,
                    approach: parsedData.breakdown.approach || parsed.scoreBreakdown?.approach || 0,
                    clarity: parsedData.breakdown.clarity || parsed.scoreBreakdown?.clarity || 0,
                    efficiency: parsedData.breakdown.efficiency || parsed.scoreBreakdown?.efficiency || 0,
                    communication: parsedData.breakdown.communication || parsed.scoreBreakdown?.communication || 0,
                  };
                }
                
                if (parsedData.suggestions && Array.isArray(parsedData.suggestions)) {
                  parsed.suggestions = parsedData.suggestions;
                }
                if (parsedData.improvements && Array.isArray(parsedData.improvements)) {
                  parsed.improvements = parsedData.improvements;
                }
                if (parsedData.mistakes && Array.isArray(parsedData.mistakes)) {
                  parsed.mistakes = parsedData.mistakes;
                }
                
                // Set summary to the actual summary text if it exists
                if (parsedData.summary) {
                  parsed.summary = parsedData.summary;
                } else {
                  // If the summary field contains the whole JSON object, clear it
                  parsed.summary = '';
                }
                
                console.log('Successfully parsed JSON from summary. Final parsed:', {
                  score: parsed.score,
                  hasScoreBreakdown: !!parsed.scoreBreakdown,
                  hasSuggestions: !!parsed.suggestions,
                  summaryText: parsed.summary
                });
              } catch (e) {
                console.warn('Failed to parse summary JSON:', e);
                console.warn('Summary content:', trimmed.substring(0, 200));
                // If parsing fails, just clear it
                parsed.summary = '';
              }
            }
          }
          
          return parsed;
        });
        setInterviews(parsedInterviews);
        calculateStats(parsedInterviews);
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
      <div className="min-h-screen  p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading interview history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
              Interview History & Analytics
            </h1>
            <div className="h-12 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your progress and see detailed feedback from all your AI interviews
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Interviews</CardTitle>
              <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">All time interviews</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Average Score</CardTitle>
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400 fill-current" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.averageScore.toFixed(1)}</div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Out of 10</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">Correctness</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.categories.correctness.toFixed(1)}</div>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">Average score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-900 dark:text-purple-100">Approach</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.categories.approach.toFixed(1)}</div>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">Average score</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Clarity</CardTitle>
              <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">{stats.categories.clarity.toFixed(1)}</div>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">Average score</p>
            </CardContent>
          </Card>
        </div>

        {/* Interview List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recent Interviews</h2>
          {interviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Interviews Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start practicing with AI interviews to track your progress
                </p>
              </CardContent>
            </Card>
          ) : (
            interviews.map((interview, index) => (
              <InterviewCard key={interview._id} interview={interview} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Interview Card Component
const InterviewCard: React.FC<{ interview: Interview; index: number }> = ({ interview, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  const score = interview.score || 0;
  const scoreColor = score >= 8 ? 'text-green-600 dark:text-green-400' : score >= 6 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';
  const scoreBg = score >= 8 ? 'bg-green-100 dark:bg-green-900/20' : score >= 6 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20';
  const scoreBorder = score >= 8 ? 'border-green-500' : score >= 6 ? 'border-yellow-500' : 'border-red-500';
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ borderLeftColor: score >= 8 ? '#22c55e' : score >= 6 ? '#eab308' : '#ef4444' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${scoreBg} border-2 ${scoreBorder}`}>
              <span className={`text-lg font-bold ${scoreColor}`}>{score}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-xs">
                  #{index + 1}
                </Badge>
                <span className="font-semibold text-base">{interview.problemSlug || 'General Interview'}</span>
                {interview.isAbandoned && (
                  <Badge variant="destructive" className="text-xs">
                    Abandoned
                  </Badge>
                )}
                {interview.isActive && (
                  <Badge variant="default" className="text-xs bg-green-500">
                    Active
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(interview.startedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
                {interview.endedAt && (
                  <span className="ml-2">
                    • {Math.round((new Date(interview.endedAt).getTime() - new Date(interview.startedAt).getTime()) / 60000)} min
                  </span>
                )}
                {interview.messageCount !== undefined && (
                  <span className="ml-2">
                    • {interview.messageCount} messages
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {expanded ? (
          <div className="space-y-5">
            {/* Summary */}
            {interview.summary && !interview.summary.trim().startsWith('{') && interview.summary.trim().length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">Summary</h4>
                </div>
                <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">{interview.summary}</p>
              </div>
            )}
            
            {/* Score Breakdown */}
            {interview.scoreBreakdown && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                  <h4 className="font-semibold">Score Breakdown</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.entries(interview.scoreBreakdown).map(([key, value]) => {
                    const val = value as number;
                    const colorClass = val >= 8 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                      val >= 6 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                    return (
                      <div key={key} className={`text-center p-3 rounded-lg border ${colorClass} border-opacity-50`}>
                        <div className="text-xs font-medium mb-1 capitalize">{key}</div>
                        <div className="text-xl font-bold">{val}/10</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Suggestions */}
            {interview.suggestions && interview.suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  <h4 className="font-semibold">Suggestions</h4>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <ul className="space-y-2">
                    {interview.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-500 dark:text-purple-400 mt-0.5">•</span>
                        <span className="text-sm leading-relaxed">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Improvements */}
            {interview.improvements && interview.improvements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold text-green-700 dark:text-green-400">Recommended Improvements</h4>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <ul className="space-y-2">
                    {interview.improvements.map((improvement, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                        <span className="text-sm leading-relaxed">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Mistakes */}
            {interview.mistakes && interview.mistakes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  <h4 className="font-semibold text-red-700 dark:text-red-400">Areas to Improve</h4>
                </div>
                <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <ul className="space-y-2">
                    {interview.mistakes.map((mistake, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-0.5">⚠</span>
                        <span className="text-sm leading-relaxed">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {interview.summary && !interview.summary.trim().startsWith('{') && interview.summary.trim().length > 0 && (
              <p className="text-sm text-muted-foreground line-clamp-2">{interview.summary}</p>
            )}
            {interview.scoreBreakdown && (
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(interview.scoreBreakdown).map(([key, value]) => {
                  const val = value as number;
                  const bgColor = val >= 8 ? 'bg-green-100 dark:bg-green-900/20' :
                                  val >= 6 ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                  'bg-red-100 dark:bg-red-900/20';
                  return (
                    <div key={key} className={`text-center p-2 rounded-lg ${bgColor}`}>
                      <div className="text-xs text-muted-foreground font-medium capitalize mb-1">{key.slice(0, 4)}</div>
                      <div className="text-base font-bold">{val}/10</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t flex justify-end">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            {expanded ? 'Show Less' : 'Show Full Details →'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
