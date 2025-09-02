"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle2, ChevronRight, Crown, MapPin, MessageSquare, Star, Target, Zap, TrendingUp, Trophy, Award, Clock, Users, Code, BookOpen, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

// Helper function to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

// Dynamic profile data - this would come from your backend
const useProfileData = () => {
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    email: "",
    imageUrl: "",
    role: "",
    country: "",
    joinDate: "",
    lastActive: "",
    stats: {
      totalProblems: 0,
      solvedProblems: 0,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 },
    },
    interviews: {
      total: 0,
      averageScore: 0,
      streakDays: 0,
      recent: []
    },
    submissions: [],
    submissionActivity: [] as { date: string; count: number }[]
  });

  // Individual loading states for each section
  const [loadingStates, setLoadingStates] = useState({
    profile: true,
    stats: true,
    interviews: true,
    submissions: true
  });
  
  const [errors, setErrors] = useState({
    profile: null as string | null,
    stats: null as string | null,
    interviews: null as string | null,
    submissions: null as string | null
  });

  // Calculate interview streak from recent interviews
  const calculateStreak = (interviews: any[]) => {
    if (interviews.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const hasInterview = interviews.some(interview => {
        const interviewDate = new Date(interview.startedAt);
        interviewDate.setHours(0, 0, 0, 0);
        return interviewDate.getTime() === checkDate.getTime();
      });
      
      if (hasInterview) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Generate submission activity data for heatmap
  const generateSubmissionActivity = (submissions: any[]) => {
    const activityMap = new Map<string, number>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    submissions.forEach((submission) => {
      const date = new Date(submission.createdAt);
      if (date >= thirtyDaysAgo) {
        const dateStr = date.toISOString().split('T')[0];
        activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
      }
    });
    
    return Array.from(activityMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  };

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, profile: true }));
        setErrors(prev => ({ ...prev, profile: null }));
        
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(prev => ({ ...prev, ...data }));
        } else {
          throw new Error('Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrors(prev => ({ ...prev, profile: 'Failed to load profile data' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, profile: false }));
      }
    };

    fetchProfile();
  }, []);

  // Load stats data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, stats: true }));
        setErrors(prev => ({ ...prev, stats: null }));
        
        const response = await fetch('/api/profile/stats');
        if (response.ok) {
          const data = await response.json();
          setProfile(prev => ({ ...prev, stats: data }));
        } else {
          throw new Error('Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setErrors(prev => ({ ...prev, stats: 'Failed to load statistics' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, stats: false }));
      }
    };

    fetchStats();
  }, []);

  // Load interview data
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, interviews: true }));
        setErrors(prev => ({ ...prev, interviews: null }));
        
        const response = await fetch('/api/interviews');
        if (response.ok) {
          const data = await response.json();
          const recentInterviews = (data.interviews || []).slice(0, 3).map((interview: any) => ({
            id: interview._id,
            title: interview.problemSlug || 'General Interview',
            score: interview.score || 0,
            date: formatRelativeTime(new Date(interview.startedAt)),
            startedAt: interview.startedAt
          }));
          
          const streakDays = calculateStreak(data.interviews || []);
          
          setProfile(prev => ({ 
            ...prev, 
            interviews: {
              ...prev.interviews,
              total: data.pagination?.total || data.interviews?.length || 0,
              recent: recentInterviews,
              streakDays
            }
          }));
        } else {
          throw new Error('Failed to fetch interviews');
        }
      } catch (error) {
        console.error('Error fetching interviews:', error);
        setErrors(prev => ({ ...prev, interviews: 'Failed to load interview data' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, interviews: false }));
      }
    };

    fetchInterviews();
  }, []);

  // Load submissions data
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoadingStates(prev => ({ ...prev, submissions: true }));
        setErrors(prev => ({ ...prev, submissions: null }));
        
        const submissionsResponse = await fetch('/api/submissions');
        if (submissionsResponse.ok) {
          const data = await submissionsResponse.json();
          const submissions = (data.submissions || []).slice(0, 5).map((submission: any) => ({
            id: submission._id,
            problemTitle: submission.problemId?.title || 'Unknown Problem',
            status: submission.status,
            language: submission.language || 'Unknown',
            date: formatRelativeTime(new Date(submission.createdAt)),
            createdAt: submission.createdAt
          }));
          
          const submissionActivity = generateSubmissionActivity(data.submissions || []);
          
          setProfile(prev => ({ 
            ...prev, 
            submissions,
            submissionActivity
          }));
        } else {
          throw new Error('Failed to fetch submissions');
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setErrors(prev => ({ ...prev, submissions: 'Failed to load submission data' }));
      } finally {
        setLoadingStates(prev => ({ ...prev, submissions: false }));
      }
    };

    fetchSubmissions();
  }, []);

  const refreshSection = async (section: keyof typeof loadingStates) => {
    setLoadingStates(prev => ({ ...prev, [section]: true }));
    setErrors(prev => ({ ...prev, [section]: null }));
    
    // Re-trigger the specific useEffect
    const event = new CustomEvent(`refresh-${section}`);
    window.dispatchEvent(event);
  };

  return { profile, loadingStates, errors, refreshSection };
};

// Simple donut with 3 difficulty segments
function DifficultyDonut({
  easy,
  medium,
  hard,
  total,
}: {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}) {
  const segments = useMemo(() => {
    const sum = Math.max(easy + medium + hard, 1);
    return [
      { value: easy / sum, color: "#22c55e" }, // emerald-500
      { value: medium / sum, color: "#f59e0b" }, // amber-500
      { value: hard / sum, color: "#94a3b8" }, // slate-400 as neutral for hard
    ];
  }, [easy, medium, hard]);

  const r = 52;
  const c = 2 * Math.PI * r;

  let offset = 0;
  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160" aria-label="Problem difficulty progress donut">
        <circle cx="80" cy="80" r={r} stroke="#1f2937" strokeWidth="12" fill="none" />
        {segments.map((s, idx) => {
          const len = s.value * c;
          const strokeDasharray = `${len} ${c - len}`;
          const strokeDashoffset = -offset;
          offset += len;
          return (
            <circle
              key={idx}
              cx="80"
              cy="80"
              r={r}
              stroke={s.color}
              strokeWidth="12"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
          );
        })}
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-semibold text-white">
          {easy + medium + hard}
          <span className="text-slate-400 text-base">/{total}</span>
        </div>
        <div className="text-sm text-emerald-400">Solved</div>
        <div className="text-xs text-slate-400">{total - (easy + medium + hard)} Remaining</div>
      </div>
    </div>
  );
}

function MiniStat({
  title,
  value,
  hint,
  color,
}: {
  title: string;
  value: string;
  hint?: string;
  color: "emerald" | "amber" | "slate";
}) {
  const colors = {
    emerald: "bg-emerald-900/40 text-emerald-300",
    amber: "bg-amber-900/40 text-amber-300",
    slate: "bg-slate-800 text-slate-300",
  } as const;
  
  return (
    <div className={cn("rounded-md px-3 py-2 text-sm", colors[color])} aria-label={`${title} ${value}`}>
      <div className="font-medium">{title}</div>
      <div className="text-xs text-slate-300/80">
        {value}
        {hint ? ` ${hint}` : ""}
      </div>
    </div>
  );
}

function ContributionHeatmap({ submissionActivity }: { submissionActivity: { date: string; count: number }[] }) {
  // Generate heatmap data from real submission activity
  const generateHeatmapData = () => {
    const weeks = 30;
    const days = weeks * 7;
    const heatmapData = new Array(days).fill(0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fill in actual submission data
    submissionActivity.forEach(({ date, count }) => {
      const submissionDate = new Date(date);
      const daysDiff = Math.floor((today.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 0 && daysDiff < days) {
        const index = days - 1 - daysDiff;
        if (index >= 0 && index < days) {
          heatmapData[index] = Math.min(count, 4); // Cap at level 4
        }
      }
    });
    
    return heatmapData;
  };

  const heatmapData = generateHeatmapData();
  const totalActiveDays = heatmapData.filter(level => level > 0).length;
  const maxStreak = Math.max(...heatmapData.map((_, i) => {
    let streak = 0;
    for (let j = i; j < heatmapData.length && heatmapData[j] > 0; j++) {
      streak++;
    }
    return streak;
  }));

  const levelToClass = (n: number) =>
    [
      "bg-slate-800", // 0
      "bg-emerald-900", // 1
      "bg-emerald-800", // 2
      "bg-emerald-600", // 3
      "bg-emerald-400", // 4
    ][n];

  if (submissionActivity.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-slate-100">Submission Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <Code className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No submission activity yet</p>
            <p className="text-sm">Start solving problems to see your activity here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-100 flex items-center justify-between">
          <span className="text-pretty">Submission activity in the past 30 days</span>
          <div className="text-xs text-slate-400">
            Total active days: {totalActiveDays} · Max streak: {maxStreak}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div
            className="grid grid-rows-7 grid-flow-col auto-cols-max gap-1 p-2 rounded-md bg-slate-950"
            role="grid"
            aria-label="Submission heatmap"
          >
            {heatmapData.map((level, idx) => (
              <div
                key={idx}
                role="gridcell"
                aria-label={`Day ${idx + 1} activity level ${level}`}
                className={cn("h-3 w-3 rounded-sm", levelToClass(level))}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          Less
          <div className="h-3 w-3 rounded-sm bg-slate-800" />
          <div className="h-3 w-3 rounded-sm bg-emerald-900" />
          <div className="h-3 w-3 rounded-sm bg-emerald-800" />
          <div className="h-3 w-3 rounded-sm bg-emerald-600" />
          <div className="h-3 w-3 rounded-sm bg-emerald-400" />
          More
        </div>
      </CardContent>
    </Card>
  );
}

function RecentActivity({ interviews, submissions }: { interviews: any[]; submissions: any[] }) {
  const [activeTab, setActiveTab] = useState("submissions");

  const renderEmptyState = (type: string) => (
    <div className="text-slate-400 text-center py-8">
      <div className="mb-3">
        {type === "submissions" && <Code className="h-12 w-12 mx-auto opacity-50" />}
        {type === "interviews" && <MessageSquare className="h-12 w-12 mx-auto opacity-50" />}
        {type === "problems" && <BookOpen className="h-12 w-12 mx-auto opacity-50" />}
      </div>
      <p className="text-lg mb-2">
        {type === "submissions" && "No submissions yet"}
        {type === "interviews" && "No interviews yet"}
        {type === "problems" && "No problems solved yet"}
      </p>
      <p className="text-sm text-slate-500">
        {type === "submissions" && "Start solving problems to see your submissions here"}
        {type === "interviews" && "Take your first AI interview to see results here"}
        {type === "problems" && "Solve problems to track your progress here"}
      </p>
    </div>
  );

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100">Recent Activity</CardTitle>
          <Button variant="ghost" className="text-slate-300 hover:text-white">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 space-y-3">
          {activeTab === "submissions" && (
            submissions.length > 0 ? (
              submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-lg bg-slate-800 hover:bg-slate-750/50 border border-slate-700 px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-green-400" />
                    <div className="text-slate-200">{submission.problemTitle}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      submission.status === "Accepted" ? "bg-green-900/40 text-green-300" : "bg-red-900/40 text-red-300"
                    )}>
                      {submission.status}
                    </Badge>
                    <Badge variant="outline" className="text-slate-400">
                      {submission.language}
                    </Badge>
                    <div className="text-xs text-slate-400">{submission.date}</div>
                  </div>
                </div>
              ))
            ) : (
              renderEmptyState("submissions")
            )
          )}
          
          {activeTab === "interviews" && (
            interviews.length > 0 ? (
              interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="rounded-lg bg-slate-800 hover:bg-slate-750/50 border border-slate-700 px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <div className="text-slate-200">{interview.title}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-900/40 text-blue-300">
                      {interview.score}/10
                    </Badge>
                    <div className="text-xs text-slate-400">{interview.date}</div>
                  </div>
                </div>
              ))
            ) : (
              renderEmptyState("interviews")
            )
          )}

          {activeTab === "problems" && renderEmptyState("problems")}
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton component
function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar Skeleton */}
          <section className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 rounded-xl bg-slate-700 animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-slate-700 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-2/3" />
                    <div className="h-8 bg-slate-700 rounded animate-pulse w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Main Content Skeleton */}
          <section className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-40 bg-slate-700 rounded animate-pulse" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-slate-700 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="h-32 bg-slate-700 rounded animate-pulse" />
            <div className="h-64 bg-slate-700 rounded animate-pulse" />
          </section>
        </div>
      </div>
    </main>
  );
}

export default function LeetCodeStyleProfilePage() {
  const { profile, loadingStates, errors, refreshSection } = useProfileData();
  const router = useRouter();

  if (loadingStates.profile) {
    return <ProfileSkeleton />;
  }

  if (errors.profile) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-2">{errors.profile}</div>
          <button 
            onClick={() => refreshSection('profile')} 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top bar spacer (simulate app header space) */}
        <div className="mb-4" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <section className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {profile.imageUrl ? (
                      <img 
                        src={profile.imageUrl} 
                        alt={profile.name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                        {profile.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center">
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-lg font-semibold">{profile.name}</div>
                    <div className="text-xs text-slate-400">@{profile.username}</div>
                    <div className="mt-2 text-sm">
                      <span className="text-slate-400">Member since</span>{" "}
                      <span className="font-semibold text-slate-100">{new Date(profile.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2">
                      <Badge className="bg-slate-800 text-slate-300">{profile.role}</Badge>
                    </div>
                    <Button className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white">Edit Profile</Button>
                  </div>
                </div>

                <Separator className="my-5 bg-slate-800" />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {profile.country}
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Last active: {profile.lastActive}
                  </div>
                </div>

                <Separator className="my-5 bg-slate-800" />

                <div>
                  <div className="text-sm font-medium mb-2 text-slate-300">Interview Stats</div>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Total Interviews</span>
                      <span>{profile.interviews.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Score</span>
                      <span>{profile.interviews.averageScore}/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Current Streak</span>
                      <span>{profile.interviews.streakDays} days</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-5 bg-slate-800" />

                <div className="text-sm">
                  <div className="font-medium mb-2 text-slate-300">Submission Stats</div>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Total Submissions</span>
                      <span>{profile.stats.totalSubmissions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Accepted</span>
                      <span>{profile.stats.acceptedSubmissions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Success Rate</span>
                      <span>{((profile.stats.acceptedSubmissions / profile.stats.totalSubmissions) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Main Column */}
          <section className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-5">
                {loadingStates.stats ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                ) : errors.stats ? (
                  <div className="text-center py-8">
                    <div className="text-red-400 mb-2">{errors.stats}</div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshSection('stats')}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Donut */}
                    <div className="flex items-center justify-center">
                      <DifficultyDonut
                        easy={profile.stats.easy.solved}
                        medium={profile.stats.medium.solved}
                        hard={profile.stats.hard.solved}
                        total={profile.stats.totalProblems}
                      />
                    </div>
                    {/* Difficulty mini cards */}
                    <div className="flex flex-col gap-3 justify-center">
                      <MiniStat
                        title="Easy"
                        value={`${profile.stats.easy.solved}/${profile.stats.easy.total}`}
                        color="emerald"
                      />
                      <MiniStat
                        title="Medium"
                        value={`${profile.stats.medium.solved}/${profile.stats.medium.total}`}
                        color="amber"
                      />
                      <MiniStat
                        title="Hard"
                        value={`${profile.stats.hard.solved}/${profile.stats.hard.total}`}
                        color="slate"
                      />
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                          onClick={() => router.push('/practice')}
                        >
                          <Target className="mr-2 h-4 w-4" /> Practice
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                          onClick={() => router.push('/interviews')}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" /> Interview
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
                          onClick={() => router.push('/problems')}
                        >
                          <BookOpen className="mr-2 h-4 w-4" /> Problems
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Heatmap */}
            {loadingStates.submissions ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                </CardContent>
              </Card>
            ) : errors.submissions ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-5">
                  <div className="text-center py-8">
                    <div className="text-red-400 mb-2">{errors.submissions}</div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshSection('submissions')}
                    >
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ContributionHeatmap submissionActivity={profile.submissionActivity} />
            )}

            {/* Recent Activity */}
            {loadingStates.interviews || loadingStates.submissions ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-5">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                  </div>
                </CardContent>
              </Card>
            ) : (errors.interviews || errors.submissions) ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-5">
                  <div className="text-center py-8">
                    <div className="text-red-400 mb-2">
                      {errors.interviews || errors.submissions}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshSection(errors.interviews ? 'interviews' : 'submissions')}
                    >
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <RecentActivity interviews={profile.interviews.recent} submissions={profile.submissions} />
            )}
          </section>
        </div>

        {/* Footer spacer */}
        <div className="mt-10 flex items-center justify-end gap-3 text-xs text-slate-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-slate-400 hover:text-slate-300 h-6 px-2"
            onClick={() => refreshSection('profile')}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    </main>
  );
}
