"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Calendar, CheckCircle2, ChevronRight, Crown, MapPin, MessageSquare, Star, Target, Zap, TrendingUp, Trophy, Award, Clock, Users, Code, BookOpen, User, Eye } from "lucide-react";
import { useParams } from "next/navigation";

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

// Public profile data hook
const usePublicProfileData = (username: string) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${username}/profile`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found');
          } else {
            setError('Failed to load profile');
          }
          return;
        }

        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching public profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchPublicProfile();
    }
  }, [username]);

  return { profile, loading, error };
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

function ContributionHeatmap() {
  const weeks = 30;
  const levels = Array.from({ length: weeks * 7 }, (_, i) => ((i * 7) % 17) % 5);

  const levelToClass = (n: number) =>
    [
      "bg-slate-800", // 0
      "bg-emerald-900", // 1
      "bg-emerald-800", // 2
      "bg-emerald-600", // 3
      "bg-emerald-400", // 4
    ][n];

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-100 flex items-center justify-between">
          <span className="text-pretty">Submission activity in the past year</span>
          <div className="text-xs text-slate-400">Total active days: 361 · Max streak: 221</div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div
            className="grid grid-rows-7 grid-flow-col auto-cols-max gap-1 p-2 rounded-md bg-slate-950"
            role="grid"
            aria-label="Submission heatmap"
          >
            {levels.map((lvl, idx) => (
              <div
                key={idx}
                role="gridcell"
                aria-label={`Day ${idx + 1} activity level ${lvl}`}
                className={cn("h-3 w-3 rounded-sm", levelToClass(lvl))}
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
          )}
          
          {activeTab === "interviews" && (
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
          )}

          {activeTab === "problems" && (
            <div className="text-slate-400 text-center py-8">
              No problem data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { profile, loading, error } = usePublicProfileData(username);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-white text-lg">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top bar spacer (simulate app header space) */}
        <div className="mb-4" />

        {/* Public Profile Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 text-slate-400 text-sm mb-2">
            <Eye className="h-4 w-4" />
            <span>Public Profile</span>
          </div>
          <h1 className="text-3xl font-bold text-white">@{username}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <section className="lg:col-span-1 space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {profile.name?.charAt(0) || username.charAt(0)}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-lg font-semibold">{profile.name || username}</div>
                    <div className="text-xs text-slate-400">@{username}</div>
                    {profile.joinDate && (
                      <div className="mt-2 text-sm">
                        <span className="text-slate-400">Member since</span>{" "}
                        <span className="font-semibold text-slate-100">{new Date(profile.joinDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {profile.role && (
                      <div className="mt-2">
                        <Badge className="bg-slate-800 text-slate-300">{profile.role}</Badge>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-5 bg-slate-800" />

                <div className="space-y-3 text-sm">
                  {profile.country && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {profile.country}
                    </div>
                  )}
                  {profile.lastActive && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Last active: {profile.lastActive}
                    </div>
                  )}
                </div>

                <Separator className="my-5 bg-slate-800" />

                {profile.interviews && (
                  <div>
                    <div className="text-sm font-medium mb-2 text-slate-300">Interview Stats</div>
                    <div className="space-y-2 text-sm text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Total Interviews</span>
                        <span>{profile.interviews.total || 0}</span>
                      </div>
                      {profile.interviews.averageScore && (
                        <div className="flex items-center justify-between">
                          <span>Average Score</span>
                          <span>{profile.interviews.averageScore}/10</span>
                        </div>
                      )}
                      {profile.interviews.streakDays && (
                        <div className="flex items-center justify-between">
                          <span>Current Streak</span>
                          <span>{profile.interviews.streakDays} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator className="my-5 bg-slate-800" />

                {profile.stats && (
                  <div className="text-sm">
                    <div className="font-medium mb-2 text-slate-300">Submission Stats</div>
                    <div className="space-y-2 text-sm text-slate-400">
                      <div className="flex items-center justify-between">
                        <span>Total Submissions</span>
                        <span>{profile.stats.totalSubmissions || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Accepted</span>
                        <span>{profile.stats.acceptedSubmissions || 0}</span>
                      </div>
                      {profile.stats.totalSubmissions && profile.stats.acceptedSubmissions && (
                        <div className="flex items-center justify-between">
                          <span>Success Rate</span>
                          <span>{((profile.stats.acceptedSubmissions / profile.stats.totalSubmissions) * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Main Column */}
          <section className="lg:col-span-2 space-y-6">
            {/* Stats */}
            {profile.stats && (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Donut */}
                    <div className="flex items-center justify-center">
                      <DifficultyDonut
                        easy={profile.stats.easy?.solved || 0}
                        medium={profile.stats.medium?.solved || 0}
                        hard={profile.stats.hard?.solved || 0}
                        total={profile.stats.totalProblems || 0}
                      />
                    </div>
                    {/* Difficulty mini cards */}
                    <div className="flex flex-col gap-3 justify-center">
                      <MiniStat
                        title="Easy"
                        value={`${profile.stats.easy?.solved || 0}/${profile.stats.easy?.total || 0}`}
                        color="emerald"
                      />
                      <MiniStat
                        title="Medium"
                        value={`${profile.stats.medium?.solved || 0}/${profile.stats.medium?.total || 0}`}
                        color="amber"
                      />
                      <MiniStat
                        title="Hard"
                        value={`${profile.stats.hard?.solved || 0}/${profile.stats.hard?.total || 0}`}
                        color="slate"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Heatmap */}
            <ContributionHeatmap />

            {/* Recent Activity */}
            <RecentActivity 
              interviews={profile.interviews?.recent || []} 
              submissions={profile.submissions || []} 
            />
          </section>
        </div>

        {/* Footer spacer */}
        <div className="mt-10 flex items-center justify-end gap-3 text-xs text-slate-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </main>
  );
}
