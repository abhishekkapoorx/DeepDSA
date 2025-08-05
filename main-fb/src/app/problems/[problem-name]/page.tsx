"use client";
import React, { useMemo, useEffect, useState } from "react";
import * as FlexLayout from "flexlayout-react";
import "./flexlayout-theme.css";
import { ProblemDescription, CodeEditor, TestcasePanel, type Problem } from "@/components/problems";
import { Editorial } from "@/components/editorial";
import { Solutions } from "@/components/solutions";
import { Submissions } from "@/components/submissions";
import { AIInterview } from "@/components/problems/AIInterview";
import { CodeVisualization } from "@/components/problems/CodeVisualization";
import { TestResults } from "@/components/problems/TestResults";
import { useIsMobile } from "@/hooks/useIsMobile";
import { desktopLayoutConfig, mobileLayoutConfig } from "@/config/layoutConfigs";
import { useParams } from "next/navigation";

export default function ProblemDetailPage() {
  const isMobile = useIsMobile();
  const params = useParams();
  const slug = params['problem-name'] as string;
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch problem data by slug
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/problems/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Problem not found');
          } else {
            setError('Failed to load problem');
          }
          return;
        }

        const data = await response.json();
        setProblem(data);
      } catch (err) {
        console.error('Error fetching problem:', err);
        setError('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProblem();
    }
  }, [slug]);

  // Create the layout model with useMemo to ensure it updates when isMobile changes
  const layoutModel = useMemo(() => {
    const config = isMobile ? mobileLayoutConfig : desktopLayoutConfig;
    return FlexLayout.Model.fromJson(config);
  }, [isMobile]);

  const factory = (node: FlexLayout.TabNode) => {
    const component = node.getComponent();

    if (loading) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (error || !problem) {
      return <div className="flex items-center justify-center h-full text-red-500">{error || 'Problem not found'}</div>;
    }

    switch (component) {
      case "description":
        return <ProblemDescription problem={problem} />;
      case "editor":
        return <CodeEditor starterCode={problem.starterCode} />;
      case "testcase":
        return <TestcasePanel testcases={problem.testcases || []} />;
      case "editorial":
        return <Editorial problemTitle={problem.title} />;
      case "solutions":
        return <Solutions />;
      case "submissions":
        return <Submissions />;
      case "ai-interview":
        return <AIInterview />;
      case "code-visualization":
        return <CodeVisualization />;
      case "test-results":
        return <TestResults />;
      default:
        return <div>Component not found</div>;
    }
  };

  const onRenderTabSet = (node: FlexLayout.TabSetNode | FlexLayout.BorderNode, renderValues: FlexLayout.ITabSetRenderValues) => {
    // Add language selector to Code tab header (only on desktop)
    if (!isMobile && node instanceof FlexLayout.TabSetNode && node.getChildren().some((child: any) => child.getComponent() === "editor")) {
      renderValues.stickyButtons.push(
        <div key="language-selector" className="language-selector flex items-center mr-2">
          <select
            defaultValue="java"
            className="px-2 py-1 text-xs font-medium bg-muted text-foreground border border-border rounded hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer min-w-[80px]"
          >
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
          </select>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-background text-foreground flex items-center justify-center">
        <div className="text-lg">Loading problem...</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-screen w-full bg-background text-foreground flex items-center justify-center">
        <div className="text-lg text-red-500">{error || 'Problem not found'}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background text-foreground">
      {/* Main layout container - full screen height since navbar is hidden */}
      <div className="h-full p-2">
        <div className="h-full w-full rounded-lg overflow-hidden border border-border/50">
          <FlexLayout.Layout
            model={layoutModel}
            factory={factory}
            onRenderTabSet={onRenderTabSet}
            realtimeResize
            key={isMobile ? 'mobile' : 'desktop'} // Force re-render when layout changes
          />
        </div>
      </div>
    </div>
  );
}