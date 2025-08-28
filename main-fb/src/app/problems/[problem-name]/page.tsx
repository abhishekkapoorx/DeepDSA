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

interface TestCase {
  input: string;
  output: string;
  isHidden: boolean;
  isExample: boolean;
}

interface ProblemWithTestCases extends Problem {
  testcases: TestCase[];
}

export default function ProblemDetailPage() {
  const isMobile = useIsMobile();
  const params = useParams();
  const slug = params['problem-name'] as string;
  
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [editorial, setEditorial] = useState<any>(null);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<string>('java');

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
        setCurrentCode(data.starterCode || '');
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

  // Fetch editorial data
  useEffect(() => {
    const fetchEditorial = async () => {
      if (!problem) return;
      
      try {
        const response = await fetch(`/api/editorials/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setEditorial(data.editorial);
        }
      } catch (err) {
        console.error('Error fetching editorial:', err);
      }
    };

    fetchEditorial();
  }, [problem, slug]);

  // Handle test results from CodeEditor
  const handleTestResults = (results: any) => {
    setTestResults(results.results);
    setIsRunning(false);
  };

  // Handle run/submit start
  const handleExecutionStart = () => {
    setIsRunning(true);
    setTestResults(null);
  };

  // Handle code changes from CodeEditor
  const handleCodeChange = (code: string, language: string) => {
    setCurrentCode(code);
    setCurrentLanguage(language);
  };

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
        return (
          <CodeEditor 
            starterCode={problem.starterCode} 
            onTestResults={handleTestResults}
            onExecutionStart={handleExecutionStart}
            onCodeChange={handleCodeChange}
          />
        );
      case "testcase":
        return (
          <TestcasePanel 
            testcases={problem.testcases || []} 
            testResults={testResults}
            isRunning={isRunning}
          />
        );
      case "editorial":
        return <Editorial problemTitle={problem.title} editorial={editorial} />;
      case "solutions":
        return <Solutions />;
      case "submissions":
        return <Submissions />;
      case "ai-interview":
        return (
          <AIInterview 
            problem={problem}
            codeContext={{
              code: currentCode,
              language: currentLanguage,
            }}
          />
        );
      case "code-visualization":
        return <CodeVisualization />;
      case "test-results":
        return <TestResults testResults={testResults} isRunning={isRunning} />;
      default:
        return <div>Component not found</div>;
    }
  };

  const onRenderTabSet = (node: FlexLayout.TabSetNode | FlexLayout.BorderNode, renderValues: FlexLayout.ITabSetRenderValues) => {
    // Language selector is now integrated into CodeEditor component
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="text-center">
          <div className="text-white text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-2">Oops!</h1>
          <p className="text-white text-lg">{error || 'Problem not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <FlexLayout.Layout
        model={layoutModel}
        factory={factory}
        onRenderTabSet={onRenderTabSet}
      />
    </div>
  );
}