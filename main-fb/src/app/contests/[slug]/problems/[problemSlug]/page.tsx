"use client";
import React, { useMemo, useEffect, useState } from "react";
import * as FlexLayout from "flexlayout-react";
import "./flexlayout-theme.css";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle, Circle } from "lucide-react";
import { ProblemDescription, TestcasePanel, type Problem } from "@/components/problems";
import { TestResults } from "@/components/problems/TestResults";
import { ContestCodeEditor } from "@/components/problems/ContestCodeEditor";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useToast } from "@/components/ui/toast";

// Contest-specific layout config (simplified - no AI Interview, no Editorial, etc.)
const contestDesktopLayoutConfig = {
  global: {
    tabEnableClose: false,
    tabEnableFloat: false,
    tabEnableDrag: true,
    tabEnableRename: false,
    splitterEnableHandle: true,
    tabEnablePopout: false,
    tabSetEnableActiveIcon: true,
    borderMinSize: 500,
    borderEnableTabScrollbar: true,
    relativeTabSize: true,
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "tabset",
        weight: 40,
        children: [
          {
            type: "tab",
            name: "Description",
            component: "description",
            id: "description",
            enableClose: false,
          },
        ],
      },
      {
        type: "col",
        weight: 60,
        children: [
          {
            type: "tabset",
            weight: 60,
            children: [
              {
                type: "tab",
                name: "Code",
                component: "editor",
                id: "editor",
                enableClose: false,
              },
            ],
          },
          {
            type: "tabset",
            weight: 40,
            children: [
              {
                type: "tab",
                name: "Test Cases",
                component: "testcase",
                id: "testcase",
                enableClose: false,
              },
              {
                type: "tab",
                name: "Test Results",
                component: "test-results",
                id: "test-results",
                enableClose: false,
              },
            ],
          },
        ],
      },
    ],
  },
};

const contestMobileLayoutConfig = {
  global: {
    tabEnableClose: false,
    tabEnableFloat: false,
    tabEnableDrag: false,
    tabEnableRename: false,
    splitterEnableHandle: false,
    tabEnablePopout: false,
    tabSetEnableActiveIcon: false,
    borderMinSize: 200,
    borderEnableTabScrollbar: true,
    relativeTabSize: true,
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "col",
        weight: 100,
        children: [
          {
            type: "tabset",
            weight: 50,
            children: [
              {
                type: "tab",
                name: "Description",
                component: "description",
                id: "description",
                enableClose: false,
              },
              {
                type: "tab",
                name: "Code",
                component: "editor",
                id: "editor",
                enableClose: false,
              },
              {
                type: "tab",
                name: "Test Cases",
                component: "testcase",
                id: "testcase",
                enableClose: false,
              },
              {
                type: "tab",
                name: "Test Results",
                component: "test-results",
                id: "test-results",
                enableClose: false,
              },
            ],
          },
        ],
      },
    ],
  },
};

const ContestProblemPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const problemSlug = params.problemSlug as string;
  const { showToast } = useToast();
  const isMobile = useIsMobile();

  const [contest, setContest] = useState<any>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  const [contestProblem, setContestProblem] = useState<any>(null);

  // Code editor state
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [problemStatus, setProblemStatus] = useState<'pending' | 'attempted' | 'solved'>('pending');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch contest details
        const contestResponse = await fetch(`/api/contests/${slug}`);
        if (!contestResponse.ok) throw new Error('Failed to fetch contest');
        const contestData = await contestResponse.json();
        setContest(contestData);

        // Find the problem in contest
        const cp = contestData.problems.find((p: any) => p.problemSlug === problemSlug);
        if (!cp) throw new Error('Problem not found in contest');
        setContestProblem(cp);

        // Fetch problem details
        const problemResponse = await fetch(`/api/problems/${problemSlug}`);
        if (!problemResponse.ok) throw new Error('Failed to fetch problem');
        const problemData = await problemResponse.json();
        setProblem(problemData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    if (slug && problemSlug) {
      fetchData();
    }
  }, [slug, problemSlug]);

  // Fetch submission history to determine problem status
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!slug || !problemSlug) return;

      try {
        const response = await fetch(`/api/contests/${slug}/problems/${problemSlug}/submissions`);
        if (response.ok) {
          const data = await response.json();

          if (data.submissions && data.submissions.length > 0) {
            const hasSolved = data.submissions.some((s: any) => s.status === 'accepted');
            const hasAttempted = data.submissions.some((s: any) => s.status !== 'accepted');

            if (hasSolved) {
              setProblemStatus('solved');
            } else if (hasAttempted) {
              setProblemStatus('attempted');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
      }
    };

    fetchSubmissions();
  }, [slug, problemSlug]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeRemaining = () => {
    if (!contest) return { hours: 0, minutes: 0, seconds: 0 };
    const end = new Date(contest.endTime);
    const remaining = Math.max(0, end.getTime() - now.getTime());

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return { hours, minutes, seconds };
  };

  const pad = (n: number) => n.toString().padStart(2, "0");

  const handleTestResults = (results: any) => {
    console.log('Test results received:', results);
    
    // Handle different response formats
    if (results.results && Array.isArray(results.results)) {
      setTestResults(results.results);
    } else if (Array.isArray(results)) {
      setTestResults(results);
    }

    // Update problem status based on results
    if (results.passed !== undefined) {
      if (results.passed) {
        setProblemStatus('solved');
        showToast('success', `🎉 All tests passed! Score: ${results.score || 0}/${contestProblem?.points || 0} points`);
      } else {
        setProblemStatus('attempted');
        showToast('warning', `Some tests failed. Score: ${results.score || 0}/${contestProblem?.points || 0} points`);
      }
    }
  };

  // Create the layout model
  const layoutModel = useMemo(() => {
    const config = isMobile ? contestMobileLayoutConfig : contestDesktopLayoutConfig;
    return FlexLayout.Model.fromJson(config);
  }, [isMobile]);

  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent();

    if (loading) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (error || !problem || !contest) {
      return (
        <div className="flex items-center justify-center h-full text-red-500">
          {error || 'Problem not found'}
        </div>
      );
    }

    switch (component) {
      case "description":
        return <ProblemDescription problem={problem} />;
      case "editor":
        return (
          <ContestCodeEditor
            contestSlug={slug}
            problemSlug={problemSlug}
            starterCode={problem.starterCode || ''}
            onTestResults={handleTestResults}
          />
        );
      case "testcase":
        return (
          <TestcasePanel
            testcases={problem.testcases || []}
            testResults={testResults}
            isRunning={false}
          />
        );
      case "test-results":
        return <TestResults testResults={testResults} isRunning={false} />;
      default:
        return <div>Component not found</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error || !problem || !contest) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-lg">{error || 'Problem not found'}</p>
          <a
            href={`/contests/${slug}/test`}
            className="mt-4 inline-block text-primary hover:underline"
          >
            Back to Contest
          </a>
        </div>
      </div>
    );
  }

  const { hours, minutes, seconds } = getTimeRemaining();
  const isExpired = hours === 0 && minutes === 0 && seconds === 0;

  return (
    <div className="h-screen flex flex-col bg-background pt-16">
      {/* Contest Header Bar */}
      <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <a
            href={`/contests/${slug}/test`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </a>
          <h1 className="text-xl font-bold text-foreground">{problem.title}</h1>
          <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
            {contestProblem.points} pts
          </span>
          {problemStatus === 'solved' && (
            <span className="text-sm px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Solved
            </span>
          )}
          {problemStatus === 'attempted' && (
            <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded flex items-center gap-1">
              <Circle className="h-3 w-3" />
              Attempted
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {isExpired ? (
              <span className="text-lg font-bold text-red-600">Time's Up!</span>
            ) : (
              <span className="text-lg font-bold text-primary">
                {pad(hours)}:{pad(minutes)}:{pad(seconds)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* FlexLayout Area */}
      <div className="flex-1 overflow-hidden p-2">
        <FlexLayout.Layout model={layoutModel} factory={factory} />
      </div>
    </div>
  );
};

export default ContestProblemPage;
