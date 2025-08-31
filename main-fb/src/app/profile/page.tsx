"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Star, 
  Award,
  Code,
  BookOpen,
  MessageSquare,
  Zap,
  Crown
} from 'lucide-react';

interface UserStats {
  totalProblems: number;
  solvedProblems: number;
  totalInterviews: number;
  averageScore: number;
  streakDays: number;
  rank: string;
  joinDate: string;
  lastActive: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

interface RecentActivity {
  id: string;
  type: 'interview' | 'problem' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  score?: number;
}

const achievements: Achievement[] = [
  {
    id: 'first-interview',
    name: 'First Interview',
    description: 'Complete your first AI interview',
    icon: '🎯',
    unlocked: true,
    unlockedDate: '2024-01-15'
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    unlocked: true,
    unlockedDate: '2024-01-20'
  },
  {
    id: 'score-9',
    name: 'Almost Perfect',
    description: 'Score 9+ in an interview',
    icon: '⭐',
    unlocked: false
  },
  {
    id: 'interview-10',
    name: 'Interview Master',
    description: 'Complete 10 interviews',
    icon: '👑',
    unlocked: false
  }
];

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'interview',
    title: 'Two Sum Interview',
    description: 'Completed interview with score 8/10',
    timestamp: '2 hours ago',
    score: 8
  },
  {
    id: '2',
    type: 'problem',
    title: 'Valid Parentheses',
    description: 'Solved problem successfully',
    timestamp: '1 day ago'
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Week Warrior',
    description: 'Unlocked achievement: 7-day streak',
    timestamp: '2 days ago'
  }
];

export default function ProfilePage() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalProblems: 150,
    solvedProblems: 45,
    totalInterviews: 12,
    averageScore: 7.8,
    streakDays: 7,
    rank: 'Bronze',
    joinDate: '2024-01-01',
    lastActive: '2024-01-22'
  });

  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'activity'>('overview');

  const solveRate = (userStats.solvedProblems / userStats.totalProblems) * 100;
  const rankColors = {
    'Bronze': 'bg-amber-600',
    'Silver': 'bg-gray-400',
    'Gold': 'bg-yellow-500',
    'Platinum': 'bg-blue-500',
    'Diamond': 'bg-purple-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                JS
              </div>
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 ${rankColors[userStats.rank as keyof typeof rankColors]} rounded-full flex items-center justify-center`}>
                <Crown className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold">John Smith</h1>
                <Badge variant="outline" className="text-sm">
                  {userStats.rank}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Active
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                Software Engineer • Joined {new Date(userStats.joinDate).toLocaleDateString()}
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.streakDays}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.solvedProblems}</div>
                  <div className="text-sm text-muted-foreground">Problems Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userStats.totalInterviews}</div>
                  <div className="text-sm text-muted-foreground">Interviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userStats.averageScore.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Avg Score</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Code className="h-4 w-4 mr-2" />
                Start Practice
              </Button>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Interview
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg p-1 mb-8 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'achievements', label: 'Achievements', icon: Trophy },
            { id: 'activity', label: 'Activity', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Problem Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Solved</span>
                    <span>{userStats.solvedProblems}/{userStats.totalProblems}</span>
                  </div>
                  <Progress value={solveRate} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {solveRate.toFixed(1)}% complete
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {userStats.solvedProblems}
                    </div>
                    <div className="text-xs text-muted-foreground">Solved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {userStats.totalProblems - userStats.solvedProblems}
                    </div>
                    <div className="text-xs text-muted-foreground">Remaining</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interview Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  Interview Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {userStats.averageScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Interviews</span>
                    <span className="font-medium">{userStats.totalInterviews}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Current Streak</span>
                    <span className="font-medium">{userStats.streakDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Active</span>
                    <span className="font-medium">{userStats.lastActive}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Practice Problems
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Interview
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Achievements
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.unlocked ? 'ring-2 ring-green-500' : 'opacity-60'}>
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <CardTitle className="text-lg">{achievement.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    {achievement.description}
                  </p>
                  {achievement.unlocked ? (
                    <div className="space-y-2">
                      <Badge className="bg-green-100 text-green-700">
                        <Award className="h-3 w-3 mr-1" />
                        Unlocked
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {achievement.unlockedDate && `Unlocked on ${new Date(achievement.unlockedDate).toLocaleDateString()}`}
                      </div>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Locked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTab === 'activity' && (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'interview' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'problem' ? 'bg-green-100 text-green-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.type === 'interview' && <MessageSquare className="h-5 w-5" />}
                      {activity.type === 'problem' && <Code className="h-5 w-5" />}
                      {activity.type === 'achievement' && <Trophy className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.title}</div>
                      <div className="text-sm text-muted-foreground">{activity.description}</div>
                    </div>
                    <div className="text-right">
                      {activity.score && (
                        <div className="text-lg font-bold text-blue-600 mb-1">
                          {activity.score}/10
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
